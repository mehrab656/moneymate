import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosClient from "../../axios-client.js";
import MainLoader from "../../components/loader/MainLoader.jsx";
import CalenderModalBody from "../../helper/CalenderModalBody.jsx";
import {
  Card,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';

// Styled component to override FullCalendar styles
const CalendarStyleWrapper = styled("div")(({ theme }) => ({
  "& .fc": {
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    "--fc-border-color": theme.palette.divider,
    "--fc-button-text-color": theme.palette.primary.contrastText,
    "--fc-button-bg-color": theme.palette.primary.main,
    "--fc-button-border-color": theme.palette.primary.main,
    "--fc-button-hover-bg-color": theme.palette.primary.dark,
    "--fc-button-hover-border-color": theme.palette.primary.dark,
    "--fc-button-active-bg-color": theme.palette.primary.dark,
    "--fc-button-active-border-color": theme.palette.primary.dark,
    "--fc-today-bg-color": theme.palette.action.hover,
    "--fc-page-bg-color": theme.palette.background.paper,
    "--fc-neutral-bg-color": theme.palette.background.default,
    "--fc-list-event-hover-bg-color": theme.palette.action.hover,
  },
  "& .fc-theme-standard td, & .fc-theme-standard th": {
    borderColor: theme.palette.divider,
  },
  "& .fc-col-header-cell-cushion, & .fc-daygrid-day-number": {
    color: theme.palette.text.primary,
    textDecoration: "none",
  },
  "& .fc-toolbar-title": {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
    },
  },
  "& .fc-button": {
    textTransform: "capitalize",
    fontWeight: 500,
    borderRadius: theme.shape.borderRadius,
    padding: "6px 16px",
    boxShadow: "none",
    "&:focus": {
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
  "& .fc-view-harness": {
    minHeight: "500px", // Ensure minimum height
    backgroundColor: theme.palette.background.paper,
  },
  "& .income-event, & .expense-event": {
    cursor: "pointer",
  },
  "& .fc-daygrid-day": {
      "&:hover": {
          backgroundColor: theme.palette.action.hover
      }
  },
  // Responsive adjustments
  [theme.breakpoints.down("sm")]: {
    "& .fc-header-toolbar": {
      flexDirection: "column",
      gap: "10px",
    },
    "& .fc-toolbar-chunk": {
      display: "flex",
      justifyContent: "center",
      width: "100%",
    },
  },
}));

export default function Calendar() {
  const [loading, setLoading] = useState(false);
  const [calendarData, setCalendarData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const theme = useTheme();

  useEffect(() => {
    document.title = "Calendar";

    setLoading(true);

    axiosClient
      .get("/calender-report")
      .then(({ data: { calenderData } }) => {
        setCalendarData(calenderData);
        setLoading(false);
      })
      .catch(() => {
        console.warn("fetch error");
        setLoading(false);
      });
  }, []);

  const handleEventClick = (event) => {
    const eventData = event.event._def.extendedProps;
    const eventClass = event.event.classNames[0];
    setSelectedEvent({ ...eventData, eventType: eventClass });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Box>
      <MainLoader loaderVisible={loading} />
      
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Calendar
        </Typography>
      </Box>

      <Card
        sx={{
          p: 2,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          backgroundColor: "background.paper",
          overflow: "hidden", // Prevent overflow
        }}
      >
        <CalendarStyleWrapper>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarData}
            selectable={true}
            eventClick={handleEventClick}
            height="auto" // Adjust height automatically
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek,dayGridDay",
            }}
          />
        </CalendarStyleWrapper>
      </Card>

      {/* Event Details Modal */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundImage: "none",
            backgroundColor: "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
             {selectedEvent?.additionalData?.category_name ?? selectedEvent?.additionalData?.payment_number ?? "Event Details"}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent?.additionalData && (
             <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
               <Table sx={{ minWidth: 300 }} aria-label="event details table">
                  <TableBody>
                     {/* 
                         CalenderModalBody returns React Fragment with <tr> elements. 
                         We need to wrap it in a custom component or render it directly if possible.
                         However, CalenderModalBody returns <tr>s directly, so it must be inside <tbody>.
                         Wait, CalenderModalBody returns:
                         <>
                            <tr>...</tr>
                            <tr>...</tr>
                         </>
                         So putting it inside <TableBody> is correct.
                     */}
                     <CalenderModalBody 
                        additionalData={selectedEvent.additionalData}
                        eventType={selectedEvent.eventType}
                     />
                  </TableBody>
               </Table>
             </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
