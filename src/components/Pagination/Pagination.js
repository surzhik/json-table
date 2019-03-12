import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Pagination.css';

function Pagination({ page, pages, onChange }) {
  // Counting start page link. We want to show max 10 links
  const startPage = Math.floor(page / 10) * 10;
  const pagesArray = new Array(Math.min(pages - startPage, 10));
  /* eslint-disable no-plusplus */
  for (let i = 0; i < pagesArray.length; i++) {
    pagesArray[i] = startPage + i + 1;
  }
  return (
    pages > 1 && (
      <div className={s.paginationHolder}>
        <ul>
          <li className={s.pageLeft}>
            <button disabled={page === 0} onClick={() => onChange(page - 1)}>
              ←
            </button>
          </li>
          {pagesArray[0] - 1 > 0 && <li>...</li>}
          {pagesArray.map(pageToShow => (
            <li key={`page_${pageToShow}`}>
              <button
                className={pageToShow === page + 1 ? s.active : null}
                onClick={() => onChange(pageToShow - 1)}
              >
                {pageToShow}
              </button>
            </li>
          ))}
          {pagesArray[pagesArray.length - 1] < pages && <li>...</li>}
          <li className={s.pageRight}>
            <button
              disabled={page + 1 >= pages}
              onClick={() => onChange(page + 1)}
            >
              →
            </button>
          </li>
        </ul>
      </div>
    )
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
export default withStyles(s)(Pagination);
