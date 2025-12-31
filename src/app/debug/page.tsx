export default function DebugPage() {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKeyDefined = !!process.env.CLERK_SECRET_KEY;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Clerk Env Debug</h1>
            <p><strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</strong> {publishableKey ? `Defined (starts with ${publishableKey.substring(0, 7)}...)` : 'Not defined'}</p>
            <p><strong>CLERK_SECRET_KEY:</strong> {secretKeyDefined ? 'Defined (value hidden)' : 'Not defined'}</p>
        </div>
    );
}
