import { FaWrench } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export function EquipmentEmptyState({ category, isSearch, onClear }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
      <div className="bg-teal-50 p-6 rounded-full mb-6 text-teal-600">
        <FaWrench className="w-16 h-16" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">No Equipment Available</h2>
      <p className="text-gray-500 max-w-md text-center mt-2 px-6">
        {isSearch ? "We couldn't find any tools matching your search. Try adjusting your filters." : `There are currently no items available in ${category} category.`}
      </p>
      <Button variant="outline" onClick={onClear} className="mt-8 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-full font-bold tracking-widest px-8" >
        View All Equipments
      </Button>
    </div>
  );
}