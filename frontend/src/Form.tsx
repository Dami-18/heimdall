import { useEffect, useState } from "react";
import { validateEmail } from "./utils";
import toast from "react-hot-toast";
import { BACKEND_URL } from "./constants";
import Success from "./Success";

const Form = () => {
    const [otpRequested, setOtpRequested] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        fetch(`${BACKEND_URL}/validate-jwt`, {credentials: 'include'}).then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    setEmail(data.email);
                    setIsAuthenticated(true);
                });
            }
        });
    }, []);

    const requestOTP = () => {
        if (validateEmail(email)) {
            const loadingToast = toast.loading("Sending OTP...");
            const formdata = new FormData();
            formdata.append("email", email);
            fetch(`${BACKEND_URL}/get-otp`, {
                method: "POST",
                body: formdata,
            })
                .then((response) => {
                    if (response.ok) {
                        toast.success("OTP sent successfully", {
                            id: loadingToast,
                        });
                        setOtpRequested(true);
                    } else {
                        response.text().then((msg) => {
                            toast.error(msg, {
                                id: loadingToast,
                            });
                        });
                    }
                })
                .catch(() => {
                    toast.error("Failed to send OTP. Please try again", {
                        id: loadingToast,
                    });
                });
        } else {
            toast.error("Invalid email address. Please use your kgpian email");
            return;
        }
    };

    const verifyOTP = () => {
        const loadingToast = toast.loading("Verifying OTP...");
        const formdata = new FormData();
        formdata.append("email", email);
        formdata.append("otp", otp);
        fetch(`${BACKEND_URL}/verify-otp`, {
            method: "POST",
            body: formdata,
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    toast.success("OTP verified successfully", {
                        id: loadingToast,
                    });
                    setIsAuthenticated(true);
                } else {
                    toast.error("Failed to verify OTP. Please try again", {
                        id: loadingToast,
                    });
                }
            })
            .catch(() => {
                toast.error("Failed to verify OTP. Please try again", {
                    id: loadingToast,
                });
            });
    };

    if (isAuthenticated) {
        return <Success email={email} />;
    }

    return (
        <div className="form-container">
            <div className="info">
                <div className="title">Heimdall</div>
                <p>The gatekeeper to MetaKGP services</p>
                <p>Please verify using your kgpian email to continue</p>
            </div>
            <div className="form">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your kgpian email"
                />
                {otpRequested ? (
                    <>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                        />
                        <button onClick={verifyOTP}>Verify</button>
                    </>
                ) : (
                    <button onClick={requestOTP}>Send OTP</button>
                )}
            </div>
        </div>
    );
};

export default Form;
