import React from "react";
import "boxicons/css/boxicons.min.css";

const Pagination = ({ page = 1, total = 0, limit = 10, onPrev, onNext }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  return (
    <div className="pagination-wrap">
      <button
        className="page-btn"
        onClick={onPrev}
        disabled={safePage <= 1}
      >
        <i className='bx bx-chevron-left'></i> Prev
      </button>

      <span className="page-info">
        Page {safePage} of {totalPages}
      </span>

      <button
        className="page-btn"
        onClick={onNext}
        disabled={safePage >= totalPages}
      >
        Next <i className='bx bx-chevron-right'></i>
      </button>

    </div>
  );
};

export default Pagination;
