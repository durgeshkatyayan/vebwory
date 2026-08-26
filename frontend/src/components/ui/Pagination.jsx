import Button from './Button';

export default function Pagination({ page, total, limit, onPageChange }) {
	const pageCount = Math.max(1, Math.ceil(total / limit));

	if (total === 0) return null;

	return (
		<div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
			<span>Page {page} of {pageCount} ({total} tasks)</span>
			<div className="flex gap-2">
				<Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
					Previous
				</Button>
				<Button variant="secondary" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
					Next
				</Button>
			</div>
		</div>
	);
}
