import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import "./App.css";

const queryClient = new QueryClient();

// Mock data - simulating a database
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Developer" },
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

// Example: Fetching user data using React Query
function UserList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>User List (React Query Demo)</h2>
      <button onClick={() => refetch()}>Refetch Users</button>
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: "20px" }}>
        <h1>React Query Demo</h1>
        <UserList />
      </div>
    </QueryClientProvider>
  );
}

export default App;
