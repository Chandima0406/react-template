import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Mock data - simulating a database
const mockUsers = [
  { id: 1, name: "Chandima Wijerathna", email: "john@example.com", role: "Developer" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Designer" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Manager" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", role: "Developer" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", role: "Tester" },
];

// Simulate async API call with local data
const fetchUsers = async (): Promise<typeof mockUsers> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Simulate random error (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to fetch users from local database");
  }
  
  return mockUsers;
};

// Fetch users with pagination (for infinite queries)
const fetchUsersPaginated = async ({ pageParam = 0 }): Promise<{ users: typeof mockUsers; nextPage: number | null }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const pageSize = 2;
  const start = pageParam * pageSize;
  const end = start + pageSize;
  const users = mockUsers.slice(start, end);
  return { users, nextPage: end < mockUsers.length ? pageParam + 1 : null };
};

// Add a new user (mutation)
const addUser = async (newUser: Omit<typeof mockUsers[0], 'id'>): Promise<typeof mockUsers[0]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const user = { ...newUser, id: Date.now() };
  mockUsers.push(user);
  return user;
};

// Example: Basic Query
function UserList() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: true, // Auto-run
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>User List (Basic Query)</h2>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? "Refetching..." : "Refetch Users"}
      </button>
      <ul style={{ textAlign: "left", maxWidth: "600px", margin: "20px auto" }}>
        {data?.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.email} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
}

// Example: Mutation
function AddUserForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const mutation = useMutation({
    mutationFn: addUser,
    onSuccess: (newUser) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert(`User ${newUser.name} added!`);
      setName("");
      setEmail("");
      setRole("");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, email, role });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add User (Mutation)</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add User"}
      </button>
    </form>
  );
}

// Example: Infinite Query
function InfiniteUserList() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["users-infinite"],
    queryFn: fetchUsersPaginated,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  if (status === "pending") return <div>Loading...</div>;
  if (status === "error") return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Infinite User List</h2>
      {data.pages.map((page, i) => (
        <ul key={i} style={{ textAlign: "left", maxWidth: "600px", margin: "20px auto" }}>
          {page.users.map((user) => (
            <li key={user.id}>
              <strong>{user.name}</strong> - {user.email} ({user.role})
            </li>
          ))}
        </ul>
      ))}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
      </button>
      <div>{isFetching && !isFetchingNextPage ? "Fetching..." : null}</div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: "20px" }}>
        <h1>React Query Comprehensive Demo</h1>
        <UserList />
        <AddUserForm />
        <InfiniteUserList />
      </div>
    </QueryClientProvider>
  );
}

export default App;
