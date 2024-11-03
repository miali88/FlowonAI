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
import { useUser } from "@clerk/nextjs"
import "@/components/loading.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Add Agent type definition
type Agent = {
  id: string;
  agentName: string;
  agentPurpose: string;
};

// Update the type definition to include lead
export type ConversationLog = {
  id: string
  created_at: string
  job_id: string
  room_name: string
  room_sid: string
  transcript: string
  user_id: string
  agent_id: string
  agentPurpose: string | null // Change to allow null
  agentName: string | null
  summary: string | null
  lead: string | null  // Add this line
}

// Update the component props
interface LibraryTableProps {
  setSelectedConversation: (conversation: ConversationLog | null) => void;
}

// Update the Loader component
function Loader() {
  return (
    <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center bg-background">
      <div className="loader"></div>
    </div>
  );
}

export function DataTableDemo({ setSelectedConversation }: LibraryTableProps) {
  const { user } = useUser();
  const [data, setData] = useState<ConversationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true }
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      lead: false  // Add this line to hide the "Lead" column by default
    })
  const [rowSelection, setRowSelection] = React.useState({})
  const [showLeadsOnly, setShowLeadsOnly] = useState(false);

  // Define handleDeleteChat inside the component
  const handleDeleteChat = React.useCallback(async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/conversation/${id}`, {
        headers: {
          'x-user-id': user?.id
        }
      });
      // Remove the deleted conversation from the local state
      setData(prevData => prevData.filter(conversation => conversation.id !== id));
      console.log(`Chat with id: ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting chat with id: ${id}`, error);
    }
  }, [user]);

  // Define columns inside the component using useMemo
  const columns = useMemo<ColumnDef<ConversationLog>[]>(() => [
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
      accessorKey: "agentName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Agent Name
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{(row.getValue("agentName") as string) || "N/A"}</div>,
    },
    {
      accessorKey: "agentPurpose",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Agent Purpose
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const agentPurpose = row.getValue("agentPurpose");
        console.log('Agent Purpose:', agentPurpose);
        return <div>{agentPurpose as string || "N/A"}</div>;
      },
    },
    {
      accessorKey: "summary",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ✨Summary
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{(row.getValue("summary") as string) || "N/A"}</div>,
    },
    {
      accessorKey: "lead",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Lead
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{(row.getValue("lead") as string) || "No"}</div>,
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
                onClick={() => handleDeleteChat(row.original.id)}
              >
                Copy chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteChat(row.original.id)}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [handleDeleteChat]) // Add handleDeleteChat to dependencies

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;   
        }

        const response = await axios.get(`${API_BASE_URL}/conversation/history`, {
          headers: {
            'x-user-id': user.id
          }
        });

        const conversations = response.data;
        console.log('Fetched conversations:', conversations);

        // Fetch agent data
        const agentResponse = await axios.get(`${API_BASE_URL}/livekit/agents`, {
          headers: {
            'x-user-id': user.id
          }
        });
        const agents = agentResponse.data.data as Agent[];

        const updatedData = conversations.map((conversation: ConversationLog) => {
          const agent = agents.find((a) => a.id === conversation.agent_id);
          return {
            ...conversation,
            agentName: agent ? agent.agentName : null,
            agentPurpose: agent ? agent.agentPurpose : null,
            summary: conversation.summary || null
          };
        });

        console.log('Updated data:', updatedData);
        setData(updatedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    }

    fetchData();
  }, [user])

  // Create a memoized filtered data array
  const filteredData = useMemo(() => {
    return showLeadsOnly ? data.filter(row => row.lead === "yes") : data;
  }, [data, showLeadsOnly]);

  const table = useReactTable({
    data: filteredData, // Use the memoized filtered data
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

  const handleRowClick = (conversation: ConversationLog) => {
    setSelectedConversation(conversation);
  };

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Button
            variant={showLeadsOnly ? "default" : "outline"}
            onClick={() => setShowLeadsOnly(!showLeadsOnly)}
          >
            {showLeadsOnly ? "Show All" : "Show Leads"}
          </Button>
          
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
