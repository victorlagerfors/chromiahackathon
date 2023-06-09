import { useContext, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.scss";

import { AuthContext } from "./blockchain/AuthContext";
import { BlockchainContext } from "./blockchain/BlockchainContext";

import Login from "./Login";

import { getEvents, getMyTickets } from "./blockchain/new_api";
import { Buy } from "./Buy";
import { DesktopView } from "./DesktopView";
import { Event } from "./Event";
import { Home } from "./Home";
import { EventType } from "./Home/EventCard/EventCard";
import { MyTickets } from "./MyTickets";
import { MyTicketType } from "./MyTickets/MyTicket/MyTicket";
import { Ticket } from "./Ticket";
import { Transfer } from "./Transfer";

const App = () => {
  const blockchain = useContext(BlockchainContext);
  const auth = useContext(AuthContext);
  const [reqEvents, setReqEvents] = useState<EventType[]>([]);
  const [event, setEvent] = useState<EventType>();
  const [ticket, setTicket] = useState<MyTicketType>();
  const [myTickets, setMyTickets] = useState<MyTicketType[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      await blockchain.init();
    };
    initializeApp();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log(auth.isLoggedIn);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      if (blockchain.gtx) {
        await auth.loginFromSession(blockchain.gtx);
      }
    };
    initializeApp();
    // eslint-disable-next-line
  }, [blockchain]);

  useEffect(() => {
    if (auth?.isLoggedIn) {
      const fetchData = async () => {
        const events = await getEvents(
          blockchain.gtx,
          auth?.disposableKeyPair?.pubKey
        );
        const eventsProps = events.map((tempEvent) => ({
          artist: tempEvent.name,
          date: new Date(tempEvent.date),
          eventTitle: tempEvent.description,
          location: tempEvent.location,
          id: tempEvent.id,
        }));
        setReqEvents(eventsProps);
        setEvent(eventsProps[0]);
      };

      fetchData();
    }
  }, [blockchain.gtx, auth?.disposableKeyPair?.pubKey, auth?.isLoggedIn]);

  useEffect(() => {
    if (auth?.isLoggedIn) {
      const fetchData = async () => {
        const reqTickets = await getMyTickets(
          blockchain.gtx,
          auth?.disposableKeyPair?.pubKey
        );
        const fetchedTickets = reqTickets.map((tempTickets) => ({
          artist: tempTickets.event_name,
          eventName: tempTickets.event_description,
          location: tempTickets.event_location,
          date: new Date(tempTickets.event_date),
          id: tempTickets.ticket_id,
        }));
        setMyTickets(fetchedTickets);
        console.log(reqTickets);
      };

      fetchData();
    }
  }, [blockchain.gtx, auth?.disposableKeyPair?.pubKey, auth?.isLoggedIn]);

  return (
    <div>
      {window.innerWidth > 600 ? (
        <DesktopView />
      ) : auth.isLoggedIn ? (
        <Routes>
          <Route
            path="/"
            element={<Home events={reqEvents} setEvent={setEvent} />}
          />
          <Route path="/event" element={<Event event={event} />} />
          <Route
            path="/my-tickets"
            element={<MyTickets tickets={myTickets} setTicket={setTicket} />}
          />
          <Route
            path="/buy"
            element={<Buy event={event} ticketId={ticket?.id} />}
          />
          <Route
            path="/ticket"
            element={<Ticket myTickets={myTickets} event={event} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/transfer" element={<Transfer id={ticket?.id} />} />
        </Routes>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
