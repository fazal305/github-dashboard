import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function getPageItems(current, total) {
  const delta = 1;
  const pages = [];
  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || (page >= current - delta && page <= current + delta)) {
      pages.push(page);
    }
  }

  const withEllipsis = [];
  let previousPage;
  for (const page of pages) {
    if (previousPage !== undefined && page - previousPage > 1) {
      withEllipsis.push(`ellipsis-${page}`);
    }
    withEllipsis.push(page);
    previousPage = page;
  }
  return withEllipsis;
}

function Pagination({ currentPage, totalPages, onPageChange, hasNextPage, hasPrevPage }) {
  // With a known totalPages, render full windowed numbered pagination.
  // Without one (endpoints like /followers or /repos that don't return a total
  // count), fall back to simple Prev/Next using the hasNextPage/hasPrevPage flags.
  const isSimpleMode = totalPages === null || totalPages === undefined;

  if (!isSimpleMode && totalPages <= 1) return null;

  const canGoPrev = isSimpleMode ? (hasPrevPage ?? currentPage > 1) : currentPage > 1;
  const canGoNext = isSimpleMode ? Boolean(hasNextPage) : currentPage < totalPages;

  return (
    <nav aria-label="Pagination">
      <ul className="gd-pagination">
        <li>
          <button
            type="button"
            className="gd-pagination__btn"
            disabled={!canGoPrev}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <FiChevronLeft size={14} aria-hidden="true" />
          </button>
        </li>

        {isSimpleMode ? (
          <li className="gd-pagination__ellipsis" aria-hidden="true">
            Page {currentPage}
          </li>
        ) : (
          getPageItems(currentPage, totalPages).map((item) =>
            typeof item === 'number' ? (
              <li key={item}>
                <button
                  type="button"
                  className={`gd-pagination__btn${item === currentPage ? ' gd-pagination__btn--active' : ''}`}
                  aria-current={item === currentPage ? 'page' : undefined}
                  aria-label={`Page ${item}`}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              </li>
            ) : (
              <li key={item} className="gd-pagination__ellipsis" aria-hidden="true">
                …
              </li>
            ),
          )
        )}

        <li>
          <button
            type="button"
            className="gd-pagination__btn"
            disabled={!canGoNext}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <FiChevronRight size={14} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
