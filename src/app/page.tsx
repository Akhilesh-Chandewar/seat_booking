"use client";
import { useEffect, useState } from "react";
import { MdChair } from "react-icons/md";
import { useClerk } from "@clerk/nextjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the Seat type
interface Seat {
  _id: string;
  isBooked: boolean;
  seatNumber: string;
  row: number; 
  bookedBy?: string; 
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [count, setCount] = useState<number>(0);
  const [booked, setBooked] = useState<string[]>([]);
  const { user, signOut } = useClerk();

  const userId = user?.id || "guest";

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const mockSeats: Seat[] = Array.from({ length: 80 }, (_, i) => ({
          _id: `${i + 1}`,
          isBooked: false,
          seatNumber: `S${i + 1}`,
          row: Math.floor(i / 7) + 1, // Row number calculation
        }));
        setSeats(mockSeats);
      } catch (error) {
        toast.error("Failed to fetch seats!");
        console.error("Failed to fetch seats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, []);

  const handleBook = () => {
    if (count <= 0) {
      toast.warn("Please select at least one seat to book.");
      return;
    }

    if (count > 7) {
      toast.warn("You can only book up to 7 seats at a time.");
      return;
    }

    const availableSeats = seats.filter((seat) => !seat.isBooked);

    if (availableSeats.length < count) {
      toast.error("Not enough available seats to book.");
      return;
    }

    // Group seats by row
    const rows: { [key: number]: Seat[] } = {};
    availableSeats.forEach((seat) => {
      if (!rows[seat.row]) rows[seat.row] = [];
      rows[seat.row].push(seat);
    });

    // Try to book seats in the same row
    let bookedSeats: Seat[] = [];
    for (const row in rows) {
      if (rows[row].length >= count) {
        bookedSeats = rows[row].slice(0, count);
        break;
      }
    }

    // If not enough seats in the same row, book nearby seats
    if (bookedSeats.length < count) {
      bookedSeats = availableSeats.slice(0, count);
    }

    // Update seat statuses
    const updatedSeats = seats.map((seat) =>
      bookedSeats.some((b) => b._id === seat._id)
        ? { ...seat, isBooked: true, bookedBy: userId }
        : seat
    );

    setSeats(updatedSeats);
    setBooked(bookedSeats.map((b) => b.seatNumber));
    setCount(0);
    toast.success("Seats booked successfully!");
  };

  const handleReset = () => {
    const resetSeats = seats.map((seat) =>
      seat.bookedBy === userId ? { ...seat, isBooked: false, bookedBy: undefined } : seat
    );
    setSeats(resetSeats);
    setBooked([]);
    toast.info("Booking reset successfully.");
  };

  if (loading) {
    return (
      <div className="bg-[#245db0] flex h-screen items-center justify-center">
        <p className="text-white text-lg">Loading seats...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#245db0] flex p-2.5 items-center justify-center">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex w-[90%] justify-around items-center gap-2.5 flex-col md:flex-row lg:flex-row h-auto md:h-screen lg:h-screen">
        <div className="grid w-[80%] md:w-[30%] lg:w-[30%] grid-cols-7 bg-white p-2.5 rounded-[20px] shadow-[rgba(0,0,0,0.35)_0px_5px_15px]">
          {seats.map((seat) => (
            <div key={seat._id} className="text-center">
              <MdChair
                size="25px"
                color={seat.isBooked ? (seat.bookedBy === userId ? "green" : "red") : "gray"}
              />
              <p className="text-[2vh] mt-[-5px]">{seat.seatNumber}</p>
            </div>
          ))}
        </div>
        <div className="flex w-[60%] md:w-[20%] lg:w-[20%] flex-col justify-center items-center bg-white p-2.5 rounded-[20px] shadow-[rgba(0,0,0,0.35)_0px_5px_15px]">
          <div className="flex items-center gap-2.5">
            <MdChair size="25px" color="gray" />
            <p>Available</p>
          </div>
          <div className="flex items-center gap-2.5">
            <MdChair size="25px" color="green" />
            <p>Your Reserved</p>
          </div>
          <div className="flex items-center gap-2.5">
            <MdChair size="25px" color="red" />
            <p>Booked by Others</p>
          </div>
        </div>
        <div className="flex w-[80%] md:w-[40%] lg:w-[40%] flex-col justify-center items-center gap-2.5 bg-white p-2.5 rounded-[50px] shadow-[rgba(0,0,0,0.35)_0px_5px_15px]">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p>Book Your Seat</p>
          <div className="flex items-center justify-center">
            <p className="w-[30%]">Seats:</p>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="border rounded p-1"
              min="0"
            />
          </div>
          {booked.length > 0 && (
            <p>Your Booked Seats: {booked.join(", ")}</p>
          )}
          <button
            onClick={handleBook}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Book
          </button>
          <button
            onClick={handleReset}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reset
          </button>
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
