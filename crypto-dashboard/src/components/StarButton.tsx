import React from 'react';

export default function StarButton({ starred, onClick }: { starred: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={starred ? 'Remove from watchlist' : 'Add to watchlist'}
      onClick={onClick}
      className={`text-xl transition ${starred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
    >
      {starred ? '★' : '☆'}
    </button>
  );
}
