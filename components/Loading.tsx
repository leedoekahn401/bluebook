import { BookOpen, HelpCircle } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <BookOpen className="w-12 h-12 text-slate-200" />
                <HelpCircle className="w-6 h-6 text-blue-600 absolute -bottom-1 -right-1 animate-bounce" />
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Loading tests...</p>
        </div>
    );
}
