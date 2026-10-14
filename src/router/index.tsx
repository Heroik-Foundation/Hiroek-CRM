// router/index.tsx
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "../components/layout";

const Welcome = lazy(() => import("../pages/welcome"));
const Home = lazy(() => import("../pages/dashboard/home"));
const Spending = lazy(() => import("../pages/dashboard/spending"));
const Trending = lazy(() => import("../pages/dashboard/trending"));
const Audience = lazy(() => import("../pages/dashboard/audience"));
const SendMessage = lazy(() => import("../pages/dashboard/sendMessage"));
const ExportData = lazy(() => import("../pages/dashboard/exportData"));
const ImportData = lazy(() => import("../pages/dashboard/importData"));
const Revenue = lazy(() => import("../pages/dashboard/revenue"));
const Ticket = lazy(() => import("../pages/dashboard/ticket"));
const TicketScanner = lazy(() => import("../pages/dashboard/ticketScanner"));
const Donation = lazy(() => import("../pages/dashboard/donation"));
const Management = lazy(() => import("../pages/dashboard/management"));
const Review = lazy(() => import("../pages/dashboard/review"));
const Settings = lazy(() => import("../pages/dashboard/settings"));
const Payment = lazy(() => import("../pages/payment"));
const NotFound = lazy(() => import("../pages/notfound"));
const AuthLoading = lazy(() => import("../pages/authLoading"));

const withSuspense = (el: React.ReactNode) => (
    <Suspense fallback={<div>Loading...</div>}>{el}</Suspense>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: withSuspense(<Welcome />),
    },
    {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
            { index: true, element: withSuspense(<Home />) },
            { path: "spending", element: withSuspense(<Spending />) },
            { path: "trends", element: withSuspense(<Trending />) },
            { path: "audience", element: withSuspense(<Audience />) },
            { path: "messaging", element: withSuspense(<SendMessage />) },
            { path: "audience/message", element: withSuspense(<SendMessage />) },
            { path: "audience/send-message", element: withSuspense(<SendMessage />) },
            { path: "audience/export", element: withSuspense(<ExportData />) },
            { path: "audience/import", element: withSuspense(<ImportData />) },
            { path: "revenue", element: withSuspense(<Revenue />) },
            { path: "ticket", element: withSuspense(<Ticket />) },
            { path: "ticket-scanner", element: withSuspense(<TicketScanner />) },
            { path: "ticket/scan", element: withSuspense(<TicketScanner />) },
            { path: "impact", element: withSuspense(<Donation />) },
            { path: "client", element: withSuspense(<Management />) },
            { path: "reviews", element: withSuspense(<Review />) },
            { path: "settings", element: withSuspense(<Settings />) },
        ],
    },
    {
        path: "/payment",
        element: withSuspense(<Payment />),
    },
    {
        path: "/loading",
        element: withSuspense(<AuthLoading />),
    },
    {
        path: "/callback",
        element: withSuspense(<AuthLoading />),
    },
    {
        path: "/auth/callback",
        element: withSuspense(<AuthLoading />),
    },
    {
        path: "/auth",
        element: withSuspense(<AuthLoading />),
    },
    {
        path: "*",
        element: withSuspense(<NotFound />),
    },
]);