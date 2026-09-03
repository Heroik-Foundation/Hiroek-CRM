// App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"; 
import { Toast } from "@heroui/react";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toast.Provider placement="bottom" />
        </QueryClientProvider>
    );
}

export default App;
