import * as React from "react"
import {
  ChevronDownIcon,
  DotsHorizontalIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import "@/components/loading.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Updated type definition based on vapi_calls table
export type CallLog = {
  id: string;
  call_id?: string;
  timestamp: string;
  type: string;
  summary: string;
  transcript: string;
  stereo_recording_url: string;
  recording_url: string;
  phone_number?: string;
  cost?: number;
  ended_reason: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds: number;
  duration_minutes: number;
  created_at: string;
  customer_number: string | null;
  user_id: string | null;
}

// Update the component props
interface CallLogTableProps {
  setSelectedCall: (call: CallLog | null) => void;
}

// Update the Loader component
function Loader() {
  return (
    <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center bg-background">
      <div className="loader"></div>
    </div>
  );
}

export function DataTableDemo({ setSelectedCall }: CallLogTableProps) {
  const { userId, getToken } = useAuth();
  const [data, setData] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true }
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Update handleDeleteCall
  const handleDeleteCall = React.useCallback(async (id: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Use the correct API endpoint path
      await axios.delete(`${API_BASE_URL}/vapi/calls/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Remove the deleted call from the local state
      setData(prevData => prevData.filter(call => call.id !== id));
      console.log(`Call with id: ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting call with id: ${id}`, error);
    }
  }, [getToken]);

  // Define columns inside the component using useMemo
  const columns = useMemo<ColumnDef<CallLog>[]>(() => [
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{new Date(row.getValue("created_at")).toLocaleString()}</div>,
      sortingFn: "datetime",
    },
    {
      accessorKey: "duration_seconds",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const seconds = row.getValue("duration_seconds") as number;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return <div>{`${minutes}m ${remainingSeconds}s`}</div>;
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }) => <div>{row.getValue("phone_number") || "—"}</div>,
    },
    {
      accessorKey: "customer_number",
      header: "Customer",
      cell: ({ row }) => <div>{row.getValue("customer_number") || "—"}</div>,
    },
    {
      accessorKey: "ended_reason",
      header: "End Reason",
      cell: ({ row }) => <div>{row.getValue("ended_reason")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  // Open audio recording in a new tab
                  const audioUrl = row.original.recording_url || row.original.stereo_recording_url;
                  if (audioUrl) {
                    window.open(audioUrl, '_blank');
                  }
                }}
              >
                Play Recording
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteCall(row.original.id)}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [handleDeleteCall]) // Add handleDeleteCall to dependencies

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          setError('User not authenticated');
          setLoading(false);
          return;   
        }

        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        console.log('Fetching call logs...');
        // Use the correct API endpoint path
        const response = await axios.get(`${API_BASE_URL}/vapi/calls`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Call logs response:', response.data);
        // API returns an array of calls directly
        setData(response.data);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching data:', error.response || error);
        setError(error.response?.data?.detail || error.message || 'Failed to fetch call logs');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, getToken]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleRowClick = (call: CallLog) => {
    setSelectedCall(call);
  };

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer"
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
