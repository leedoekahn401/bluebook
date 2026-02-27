import TestEngine from "@/components/TestEngine";

export default async function TestPage({ params }: { params: { id: string } }) {
    // Extract id correctly since it's a promise in newer Next.js or just pass down depending on types.
    const { id } = await params;

    return <TestEngine testId={id} />;
}
