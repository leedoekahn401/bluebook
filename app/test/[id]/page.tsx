import TestEngine from "@/components/TestEngine";

export default async function TestPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    return <TestEngine testId={id} />;
}
