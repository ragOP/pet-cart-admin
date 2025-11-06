import React, { useMemo, useState, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Typography from "@/components/typography";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultPageSizeOptions = [10, 20, 30, 40, 50];

const defaultGetRowId = (row, index) => {
  if (row?._id) return row._id;
  if (row?.id) return row.id.toString();
  return String(index);
};

const normalizeColumns = (columns) => {
  return (columns || []).map((col) => {
    if (
      typeof col.accessorKey !== "undefined" ||
      typeof col.accessorFn !== "undefined" ||
      typeof col.id !== "undefined"
    ) {
      return col;
    }

    const transformed = {
      id: col.key,
      accessorKey: col.key,
      header: () => <Typography>{col.label}</Typography>,
      enableSorting: col.enableSorting ?? true,
      cell: (info) =>
        col.render ? (
          col.render(info.getValue(), info.row.original)
        ) : (
          <Typography>{info.getValue()}</Typography>
        ),
    };

    return transformed;
  });
};

function CustomDataGrid({
  columns,
  data,
  isLoading,
  error,
  emptyStateMessage = "No records found.",
  perPage = 10,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onPerPageChange,
  enableRowSelection = false,
  selectedRowIds,
  onSelectedRowIdsChange,
  getRowId = defaultGetRowId,
  sorting,
  onSortingChange,
  pageSizeOptions = defaultPageSizeOptions,
  renderToolbar,
  className,
  showPageSizeSelector = true,
}) {
  const [internalSorting, setInternalSorting] = useState([]);
  const [internalRowSelection, setInternalRowSelection] = useState({});

  const sortingState = sorting ?? internalSorting;
  const handleSortingChange = onSortingChange ?? setInternalSorting;

  const rowSelectionState = selectedRowIds ?? internalRowSelection;
  const handleRowSelectionChange = useCallback(
    (updater) => {
      const nextValue =
        typeof updater === "function"
          ? updater(rowSelectionState)
          : updater ?? {};

      if (!selectedRowIds) {
        setInternalRowSelection(nextValue);
      }

      onSelectedRowIdsChange?.(nextValue);
    },
    [rowSelectionState, selectedRowIds, onSelectedRowIdsChange]
  );

  const resolvedColumns = useMemo(() => {
    const normalized = normalizeColumns(columns);

    if (!enableRowSelection) {
      return normalized;
    }

    return [
      {
        id: "__select__",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <div
            className="flex items-center justify-center"
            data-row-selection-control
          >
            <Checkbox
              checked={
                table.getIsAllRowsSelected()
                  ? true
                  : table.getIsSomeRowsSelected()
                  ? "indeterminate"
                  : false
              }
              onCheckedChange={(value) =>
                table.toggleAllRowsSelected(!!value)
              }
              aria-label="Select all rows"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center"
            data-row-selection-control
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
      },
      ...normalized,
    ];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data: data || [],
    columns: resolvedColumns,
    state: {
      sorting: sortingState,
      rowSelection: rowSelectionState,
    },
    onSortingChange: handleSortingChange,
    onRowSelectionChange: handleRowSelectionChange,
    enableRowSelection,
    getRowId: (row, index) => String(getRowId(row, index)),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPagesComputed = Math.max(totalPages, 1);
  const currentPageClamped = Math.min(
    Math.max(currentPage, 1),
    totalPagesComputed
  );

  const handlePerPageChange = (value) => {
    const nextValue = Number(value);
    onPerPageChange?.(nextValue);
  };

  const handlePageChange = (page) => {
    onPageChange?.(page);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load data. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          {emptyStateMessage}
        </div>
      );
    }

    return (
      <>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortingHandler = header.column.getToggleSortingHandler();

                  return (
                    <TableHead
                      key={header.id}
                      onClick={canSort ? sortingHandler : undefined}
                      className={cn(
                        "select-none",
                        canSort ? "cursor-pointer" : "cursor-default"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ArrowUp size={14} />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ArrowDown size={14} />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const handleRowClick = (event) => {
                if (!enableRowSelection) return;
                if (event.defaultPrevented) return;

                const target = event.target;
                const isIgnored = target.closest(
                  [
                    "[data-row-selection-control]",
                    "[data-no-row-select]",
                    "button",
                    "a",
                    "input",
                    "textarea",
                    "select",
                    "label",
                    '[role="button"]',
                  ].join(", ")
                );

                if (isIgnored) {
                  return;
                }

                row.toggleSelected();
              };

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={handleRowClick}
                  className={cn(
                    enableRowSelection ? "cursor-pointer" : undefined
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <Typography variant="small" className="text-muted-foreground">
                Rows per page
              </Typography>
              <Select
                value={String(perPage)}
                onValueChange={handlePerPageChange}
                disabled={!onPerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPageClamped > 1) {
                      handlePageChange(currentPageClamped - 1);
                    }
                  }}
                  className={
                    currentPageClamped === 1
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>

              {currentPageClamped > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(1);
                      }}
                      isActive={currentPageClamped === 1}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </>
              )}

              {Array.from({ length: totalPagesComputed }, (_, index) => index + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPagesComputed ||
                    (page >= currentPageClamped - 2 &&
                      page <= currentPageClamped + 2)
                  );
                })
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === currentPageClamped}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {currentPageClamped < totalPagesComputed - 2 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(totalPagesComputed);
                      }}
                      isActive={currentPageClamped === totalPagesComputed}
                    >
                      {totalPagesComputed}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPageClamped < totalPagesComputed) {
                      handlePageChange(currentPageClamped + 1);
                    }
                  }}
                  className={
                    currentPageClamped === totalPagesComputed
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </>
    );
  };

  return (
    <Card className={cn("overflow-hidden pt-0 pb-2 gap-1", className)}>
      {renderToolbar ? (
        <div className="border-b px-4 py-3">
          {renderToolbar({ table })}
        </div>
      ) : null}
      {renderContent()}
    </Card>
  );
}

export default CustomDataGrid;

