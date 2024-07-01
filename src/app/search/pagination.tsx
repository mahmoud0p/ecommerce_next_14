import { SetStateAction } from "jotai";
import Link from "next/link";
import { Dispatch } from "react";

export const SearchPagination = ({
  page,
  setPage,
  length
}: {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  length: number;
}) => {
  return (
    <div className="absolute bottom-3 right-1/2 translate-x-1/2">
      <nav aria-label="Page navigation ">
        <ul className="flex items-center -space-x-px h-8 text-sm">
          <li>
            <Link
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (page === 1) {
                  return;
                } else {
                  setPage(page - 1);
                }
              }}
              className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-zinc-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-white"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="w-2.5 h-2.5 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
            </Link>
          </li>
          {Array(length)
            .fill(null)
            .map((_, i) => (
              <li key={i}>
                <Link
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(prev => prev < length ? prev - 1: prev);
                  }}
                  className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                    page === i + 1
                      ? "dark:bg-zinc-700 dark:text-white bg-white"
                      : "dark:bg-zinc-900 bg-slate-200 text-gray-500 dark:text-gray-400"
                  } dark:border-gray-700 dark:hover:bg-zinc-700 `}
                >
                  {i + 1}
                </Link>
              </li>
            ))}
          <li>
            <Link
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (page === length) {
                  return;
                } else {
                    setPage(prev => prev < length ? prev + 1: prev);
                }
              }}
              className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-zinc-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-white"
            >
              <span className="sr-only">Next</span>
              <svg
                className="w-2.5 h-2.5 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
