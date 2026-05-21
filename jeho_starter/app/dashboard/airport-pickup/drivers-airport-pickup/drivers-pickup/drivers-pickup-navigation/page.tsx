"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, MapPin, Calendar } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";

interface PickupRequest {
  id: string;
  passengerName: string;
  location: string;
  time: string;
}

// 1. Define your mock data outside or inside the component
const MOCK_DATA: PickupRequest[] = [
  {
    id: "1",
    passengerName: "John Doe",
    location: "Terminal 3, Arrival Gate A2",
    time: "Today, 02:30 PM",
  },
  {
    id: "2",
    passengerName: "Sarah Jenkins",
    location: "International Terminal, Gate 5",
    time: "Today, 04:15 PM",
  },
  {
    id: "3",
    passengerName: "Michael Smith",
    location: "Terminal 1, Baggage Claim",
    time: "Tomorrow, 09:00 AM",
  },
];

export default function DriverPickupNavigation() {
  const router = useRouter();
  
  // 2. Initialize state with the mock data
  const [requests, setRequests] = useState<PickupRequest[]>(MOCK_DATA);

  const handleAcceptRequest = (id: string) => {
    router.push(`/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-confirmation?id=${id}`);
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto p-5 mb-10">
        <div className="py-1">
          <Button 
            variant="ghost" 
            className="mb-6 bg-gray-200 hover:bg-gray-400 text-gray-700" 
            onClick={() => router.back()} 
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12">
          <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
            Available Airport Pickups
          </h1>

          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div 
                  key={request.id} 
                  className="flex flex-col md:flex-row items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-[#2d7a7a] transition-colors" 
                >
                  <div className="space-y-2 mb-4 md:mb-0">
                    <h3 className="font-semibold text-lg text-gray-900">{request.passengerName}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-[#2d7a7a]" />
                      {request.location}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-[#2d7a7a]" />
                      {request.time}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAcceptRequest(request.id)} 
                    className="bg-[#2d7a7a] hover:bg-[#246060] text-white px-8" 
                  >
                    Accept & Navigate
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Car className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">No requests available</h2>
              <p className="text-gray-500 max-w-xs mt-2">
                There are currently no airport pickup requests in your area. Please check back later.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 border-[#2d7a7a] text-[#2d7a7a] hover:bg-[#f0f9f9]" 
                onClick={() => setRequests(MOCK_DATA)} // Changed reload to re-fill data for testing
              >
                Refresh List
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}




// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Car, MapPin, Calendar } from "lucide-react";
// import DashboardShell from "@/components/dashboard/dashboard-layout";


// interface PickupRequest {
//   id: string;
//   passengerName: string;
//   location: string;
//   time: string;
// }

// export default function DriverPickupNavigation() {
//   const router = useRouter();
//   const [requests, setRequests] = useState<PickupRequest[]>([]);

//   const handleAcceptRequest = (id: string) => {
//     router.push(`/dashboard/airport-pickup/drivers-pickup/drivers-pickup-confirmation?id=${id}`);
//   };

//   return (
//     <DashboardShell>
//       <div className="max-w-5xl mx-auto p-5 mb-10">
//         <div className="py-1">
//           <Button variant="ghost" className="mb-6 bg-gray-200 hover:bg-gray-400 text-gray-700" onClick={() => router.back()} >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12">
//           <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
//             Available Airport Pickups
//           </h1>

//           {requests.length > 0 ? (
//             <div className="space-y-4">
//               {requests.map((request) => (
//                 <div key={request.id} className="flex flex-col md:flex-row items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-[#2d7a7a] transition-colors" >
//                   <div className="space-y-2 mb-4 md:mb-0">
//                     <h3 className="font-semibold text-lg text-gray-900">{request.passengerName}</h3>
//                     <div className="flex items-center text-gray-600 text-sm">
//                       <MapPin className="h-4 w-4 mr-2 text-[#2d7a7a]" />
//                       {request.location}
//                     </div>
//                     <div className="flex items-center text-gray-600 text-sm">
//                       <Calendar className="h-4 w-4 mr-2 text-[#2d7a7a]" />
//                       {request.time}
//                     </div>
//                   </div>
//                   <Button onClick={() => handleAcceptRequest(request.id)} className="bg-[#2d7a7a] hover:bg-[#246060] text-white px-8" >
//                     Accept & Navigate
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <div className="bg-gray-100 p-6 rounded-full mb-4">
//                 <Car className="h-12 w-12 text-gray-400" />
//               </div>
//               <h2 className="text-xl font-semibold text-gray-900">No requests available</h2>
//               <p className="text-gray-500 max-w-xs mt-2">
//                 There are currently no airport pickup requests in your area. Please check back later.
//               </p>
//               <Button variant="outline" className="mt-6 border-[#2d7a7a] text-[#2d7a7a] hover:bg-[#f0f9f9]" onClick={() => window.location.reload()} >
//                 Refresh List
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>
//     </DashboardShell>
//   );
// }