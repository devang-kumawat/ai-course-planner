import CourseForm from "../../components/CourseForm";

export default function HomePage() {
    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-start py-20 bg-gradient-to-b from-blue-50 via-slate-100 to-blue-100">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-1 text-gray-900 font-sans tracking-tight leading-tight">AI Powered Course Scheduler</h1>
            <CourseForm />
        </main>
    );
}