/* ============================================================
   BLOG PAGINATION — client-side, progressive, SEO-safe.

   Opt in by putting data-blog-pager on the card grid:

       <div class="service-grid blog-grid" data-blog-pager="9">

   The value is cards per page. Omit the attribute and nothing happens,
   which is how a site that does not want this stays untouched.

   WHY CLIENT-SIDE RATHER THAN blog-2.html, blog-3.html

   Every card stays in the HTML and is only hidden with a class, so crawlers
   still see all 39 posts and all 39 JSON-LD blocks on one URL. Splitting the
   page into files would divide that signal across several thin pages and
   leave the JSON-LD scattered, which is the opposite of what this page is
   for. It also means blog-sync and this script never have to agree on
   anything: the sync prepends cards to the grid, and this recounts on load.

   WHY A CLASS AND NOT THE hidden ATTRIBUTE

   `[hidden]` is display:none at specificity 0,1,0 and the cards are
   `.service-card`, which sets display:flex at the same specificity but later
   in the stylesheet. The attribute loses and every card stays visible. The
   class below carries !important for exactly that reason.

   No framework, no build step, no dependency on main.js.
   ============================================================ */
(function () {
  'use strict';

  var HIDDEN = 'blog-pager-hide';
  var PARAM = 'p';

  function init() {
    var grid = document.querySelector('[data-blog-pager]');
    if (!grid) return;

    var perPage = parseInt(grid.getAttribute('data-blog-pager'), 10);
    if (!perPage || perPage < 1) perPage = 9;

    var cards = Array.prototype.filter.call(grid.children, function (el) {
      return el.tagName === 'ARTICLE';
    });

    // Below one full page there is nothing to page through, and an empty
    // pager reads as a broken control rather than a short blog.
    if (cards.length <= perPage) return;

    var pageCount = Math.ceil(cards.length / perPage);

    var nav = document.createElement('nav');
    nav.className = 'blog-pager';
    nav.setAttribute('aria-label', 'Blog pages');
    grid.parentNode.insertBefore(nav, grid.nextSibling);

    var current = 0;

    function pageFromUrl() {
      var m = new RegExp('[?&]' + PARAM + '=(\\d+)').exec(window.location.search);
      var n = m ? parseInt(m[1], 10) : 1;
      if (!n || n < 1) n = 1;
      if (n > pageCount) n = pageCount;
      return n;
    }

    /** Which page numbers to render: first, last, and current +/- 1. */
    function windowed(page) {
      var out = [];
      for (var i = 1; i <= pageCount; i++) {
        if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) out.push(i);
        else if (out[out.length - 1] !== '…') out.push('…');
      }
      return out;
    }

    function button(label, page, opts) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'blog-pager__btn' + (opts && opts.cls ? ' ' + opts.cls : '');
      b.textContent = label;
      if (opts && opts.aria) b.setAttribute('aria-label', opts.aria);
      if (opts && opts.disabled) b.disabled = true;
      if (opts && opts.currentPage) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', function () { show(page, true); });
      return b;
    }

    function renderNav(page) {
      nav.textContent = '';
      nav.appendChild(button('← Prev', page - 1, {
        cls: 'blog-pager__btn--edge', aria: 'Previous page', disabled: page === 1
      }));

      windowed(page).forEach(function (n) {
        if (n === '…') {
          var s = document.createElement('span');
          s.className = 'blog-pager__gap';
          s.setAttribute('aria-hidden', 'true');
          s.textContent = '…';
          nav.appendChild(s);
          return;
        }
        nav.appendChild(button(String(n), n, {
          cls: n === page ? 'is-active' : '',
          aria: 'Page ' + n,
          currentPage: n === page
        }));
      });

      nav.appendChild(button('Next →', page + 1, {
        cls: 'blog-pager__btn--edge', aria: 'Next page', disabled: page === pageCount
      }));
    }

    function show(page, userInitiated) {
      if (page < 1 || page > pageCount || page === current) return;
      current = page;

      var start = (page - 1) * perPage;
      var end = start + perPage;
      cards.forEach(function (card, i) {
        card.classList.toggle(HIDDEN, i < start || i >= end);
      });

      renderNav(page);

      // Only touch the URL and the scroll position when a person clicked.
      // Doing either on first paint would fight the browser restoring an
      // anchor or a remembered scroll offset.
      if (userInitiated) {
        try {
          var url = new URL(window.location.href);
          if (page === 1) url.searchParams.delete(PARAM);
          else url.searchParams.set(PARAM, String(page));
          window.history.replaceState({}, '', url);
        } catch (e) { /* older browser, URL is cosmetic here */ }

        var top = grid.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
      }
    }

    show(pageFromUrl(), false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
