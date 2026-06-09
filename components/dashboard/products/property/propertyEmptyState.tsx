import { FaHome } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export function PropertyEmptyState({ category, isSearch, onClear }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
      <div className="bg-teal-50 p-6 rounded-full mb-6 text-teal-600">
        <FaHome className="w-16 h-16" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900">No Property Available</h3>
      <p className="text-gray-500 max-w-md text-center mt-2 px-6">
        {isSearch ? "No properties match your search criteria. Try broadening your location." : `There are currently no items available in ${category} category.`}
      </p>
       <Button variant="outline" onClick={onClear} className="mt-8 border-teal-600 text-teal-600 hover:bg-blue-50 rounded-full font-bold tracking-widest px-8" >
        View All Properties
      </Button>
    </div>
  );
}

