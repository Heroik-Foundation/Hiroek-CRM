export const URLS = {

    GET_DASHBOARD_DATA: (eventPartnerId: string) => `/analytics/dashboard-performance-metric/${eventPartnerId}`,
    GET_GENDER_SPLIT: (eventPartnerId: string) => `/analytics/get-gender-split/${eventPartnerId}`,
    GET_CUSTOMER_AGE_DISTRIBUTION: (eventPartnerId: string) => `/analytics/get-customers-age-distribution/${eventPartnerId}`,
    GET_AUDIENCE_BY_LOCATION: (eventPartnerId: string) => `/analytics/get-audience-stats-by-location/${eventPartnerId}`,
    GET_ACQUISITION_CHANNEL: (eventPartnerId: string) => `/analytics/get-acquisition-channel-chart/${eventPartnerId}`,
    GET_CONVERSION_FUNNEL: (eventPartnerId: string) => `/analytics/conversion-funnel/${eventPartnerId}`,

    GET_SPENDING: (eventPartnerId: string) => `/analytics/ticket-spend-distribution/${eventPartnerId}`,
    GET_TICKET_SPEND_DISTRIBUTION: (eventPartnerId: string) => `/analytics/ticket-spend-distribution-stat/${eventPartnerId}`,


    GET_PEAK_EVENT_TIMES: (eventPartnerId: string) => `/analytics/peak-event-times/${eventPartnerId}`,
    GET_ATTENDANCE_BY_DATE: (eventPartnerId: string) => `/analytics/purchase-over-time/${eventPartnerId}`,
    GET_EVENT_CATEGORY_POPULARITY: (eventPartnerId: string) => `/analytics/top-performing-categories/${eventPartnerId}`,
    GET_FORCAST: (eventPartnerId: string) => `/analytics/ticket-purchase-forecast/${eventPartnerId}`,

    GET_AUDIENCE_SEGMENT_METRICS: (eventPartnerId: string) => `/analytics/audience-segments-metrics/${eventPartnerId}`,
    GET_AUDIENCE_SEGMENT_CUSTOMER: (eventPartnerId: string) => `/analytics/audience-segments-customers/${eventPartnerId}`,

    GET_REVENUE_METRICS: (organizerId: string) => `/analytics/performance-metric/${organizerId}`,
    GET_MONTHLY_REVENUE_TREND: (organizerId: string) => `/analytics/monthly-revenue-trend/${organizerId}`,
    GET_REVENUE_BY_EVENT: (organizerId: string) => `/analytics/event-revenue/${organizerId}`,
    GET_EVENT_PERFORMANCE_RECORD: (organizerId: string) => `/analytics/event-performance-record/${organizerId}`,

    GET_DONATION_METRICS: (organizerId: string) => `/analytics/donation-metric/${organizerId}`,
    GET_DONATION_TREND: (organizerId: string) => `/analytics/donation-trend/${organizerId}`,
    GET_DONATION_FREQUENCY: (organizerId: string) => `/analytics/donation-frequency/${organizerId}`,
    GET_TOP_DONORS: (organizerId: string) => `/analytics/top-donors/${organizerId}`,
    GET_EVENT_DONATIONS: (organizerId: string) => `/analytics/get-event-donations/${organizerId}`,

    GET_REVIEWS: (organizerId: string) => `/analytics/reviews/${organizerId}`,
    GET_REVIEWS_STATS: (organizerId: string) => `/analytics/reviews-stats/${organizerId}`,

    GET_USERS_DATA: "/event-partners/current-partner",
    USERS: "/user",
    EDIT_USER: "/event-partners/edit-details",

    GET_PLANS: "/event-partners/get-plans",
    GET_CURRENT_PLAN: "/event-partners/subscription/get-subscription",
    CHANGE_PLANS: "/event-partners/subscription/change-subscription-plan",

    GET_TEAM: (eventPartnerId: string) =>
        `/event-partners/account-management/get-members/${eventPartnerId}`,
    ADD_TEAM: "/event-partners/account-management/create-team-member",
    DELETE_TEAM_MEMBER: (memberUserId: string) =>
        `/event-partners/account-management/delete-member/${memberUserId}`,
    UPDATE_TEAM_MEMBER: (memberUserId: string) =>
        `/event-partners/account-management/update-member-details/${memberUserId}`,
    GET_EMAIL_BUNDLES: "/email-bundles",
    GET_EMAIL_BALANCE: "/email-bundles/balance",
    PURCHASE_EMAIL_BUNDLE: (bundleId: string) =>
        `/email-bundles/purchase-bundle/${bundleId}`,
    GET_TICKET_SCAN_LOGS: "/events/ticket-scan-logs",
    GET_ALL_EVENTS: "/events/all-events",
    CREATE_CAMPAIGN: "/event-partners/campaign/create-campaign",
};   