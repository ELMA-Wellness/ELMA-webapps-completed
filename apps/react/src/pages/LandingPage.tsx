import React, { CSSProperties, useEffect, useState } from "react";
import { addData } from "../firebase/firestore";


const IS_APP_LAUNCHED =
    import.meta.env.VITE_APP_LAUNCHED === "true";

const ANDROID_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.elmadevs.ElMAAPP&hl=en_IN"; // TODO: replace
const IOS_STORE_URL =
    "https://apps.apple.com/app/id1234567890"; // TODO: replace

function detectDevice() {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    return "desktop";
}

const AppLanding = () => {
    const [device, setDevice] = useState("unknown");
    const [contact, setContact] = useState("");
    const [status, setStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Track scan / visit in Firestore
    useEffect(() => {
        const deviceType = detectDevice();
        setDevice(deviceType);

        const params = new URLSearchParams(window.location.search);
        const source = params.get("source") || "qr_or_direct";

        // const logScan = async () => {
        //   try {
        //     await addData('qrScans', {
        //       device: deviceType,
        //       userAgent: navigator.userAgent,
        //       source,
        //       path: window.location.pathname + window.location.search,
        //       referrer: document.referrer || null,
        //       createdAt: new Date(),
        //     });
        //   } catch (err) {
        //     console.error("Error logging scan: ", err);
        //   }
        // };

        // logScan();
    }, []);

    // Redirect to App Stores after launch
    useEffect(() => {
        if (!IS_APP_LAUNCHED) return;

        // optional: allow ?preview=true to bypass redirect for you
        const params = new URLSearchParams(window.location.search);
        if (params.get("preview") === "true") return;

        const deviceType = detectDevice();
        setDevice(deviceType);

        if (deviceType === "ios") {
            setRedirecting(true);
            window.location.href = IOS_STORE_URL;
        } else if (deviceType === "android") {
            setRedirecting(true);
            window.location.href = ANDROID_STORE_URL;
        } else {
            setStatus("Please open this link on your phone to install the app.");
        }
    }, []);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!contact.trim()) {
            setStatus("Please enter your email or phone.");
            return;
        }
        setSubmitting(true);
        setStatus("");

        try {


            await addData('qrScans', {
                email: contact,
                createdAt: new Date(),
                device,
                source: "coming_soon_page",
                userAgent: navigator.userAgent,
                path: window.location.pathname + window.location.search,
                referrer: document.referrer || null,



            })

            setStatus("Thank you! We'll notify you when we launch. 🎉");
            setContact("");
        } catch (err) {
            console.error(err);
            setStatus("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // If launched, user will quickly redirect; but we still show minimal UI:
    //   if (IS_APP_LAUNCHED) {
    //     return (
    // <div style={styles.container}>
    // <h1 style={styles.title}>ELMA App</h1>
    //         {redirecting ? (
    // <p style={styles.subtitle}>
    //             Redirecting you to the app store…
    // </p>
    //         ) : (
    // <p style={styles.subtitle}>{status}</p>
    //         )}
    // </div>
    //     );
    //   }

    // Pre-launch Coming Soon UI
    return (
        <div style={styles.page}>
            <div style={styles.hero}>
                <div style={styles.left}>
                    <h1 style={styles.title}>ELMA App</h1>
                    <p style={styles.subtitle}>
                        Your companion for better wellness. We’re launching soon –
                        be the first to know.
                    </p>

                    <form style={styles.form} onSubmit={handleSubmit}>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Enter email or phone"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                        <button
                            type="submit"
                            style={styles.button}
                            disabled={submitting}
                        >
                            {submitting ? "Submitting…" : "Notify me on launch"}
                        </button>
                    </form>

                    {status && <p style={styles.status}>{status}</p>}

                    <p style={styles.deviceInfo}>
                        Detected device: <strong>{device}</strong>
                    </p>
                </div>

                <div style={styles.right}>
                    <div style={styles.phoneMock}>
                        <div style={styles.phoneScreen}>
                            {/* Replace this later with an actual app screenshot */}
                            <p style={styles.previewText}>ELMA App Preview</p>
                            <p style={{ fontSize: 12, opacity: 0.8 }}>
                                (Replace with real screenshots later)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={styles.footer}>
                <p>© {new Date().getFullYear()} ELMA Wellness. All rights reserved.</p>
            </footer>
        </div>
    );
};

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "radial-gradient(circle at top, #f4f7ff, #ffffff)",
    },
    hero: {
        flex: 1,
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "row",
        gap: 40,
        alignItems: "center",
        justifyContent: "space-between",
    },
    left: {
        flex: 1,
    },
    right: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
    },
    title: {
        fontSize: 40,
        fontWeight: 700,
        marginBottom: 16,
        color: "#07112E",
    },
    subtitle: {
        fontSize: 18,
        lineHeight: 1.5,
        maxWidth: 480,
        marginBottom: 24,
        color: "#4a5676",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 380,
    },
    input: {
        padding: "12px 14px",
        fontSize: 16,
        borderRadius: 10,
        border: "1px solid #d0d6e6",
        outline: "none",
    },
    button: {
        padding: "12px 14px",
        fontSize: 16,
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg, #07112E, #2a4bff)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 600,
    },
    status: {
        marginTop: 10,
        fontSize: 14,
        color: "#0b1324",
    },
    deviceInfo: {
        marginTop: 16,
        fontSize: 13,
        color: "#7f879f",
    },
    phoneMock: {
        width: 260,
        height: 520,
        borderRadius: 40,
        border: "1px solid #d5dbf0",
        padding: 16,
        boxShadow: "0 18px 50px rgba(7, 17, 46, 0.10)",
        background: "#f8f9ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    phoneScreen: {
        width: "100%",
        height: "100%",
        borderRadius: 30,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    previewText: {
        fontWeight: 600,
        fontSize: 18,
    },
    footer: {
        marginTop: 40,
        textAlign: "center",
        fontSize: 12,
        color: "#9aa1b8",
    },
    container: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
};

export default AppLanding;
