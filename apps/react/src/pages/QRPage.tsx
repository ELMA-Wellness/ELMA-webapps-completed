import React, { useEffect, useRef } from "react";
//@ts-ignore
import "../styles/SessionExpired.css";
import { useSearchParams } from "react-router-dom";
import SessionPage from "./SessionPage";


const QRPage: React.FC = () => {
    const [params] = useSearchParams();

    const sessionCode = params.get("sessionCode");
    const userId = params.get("userId");
    const role = params.get("role");
    const name = params.get("name")
    const profession = params.get("profession")
    const startTime = params.get("startTime");
    const email = params.get("email")
    const photo = params.get("photo")
    const therapistPhoto = params.get("therapistPhoto")
    const clientPhoto = params.get("patientPhoto")
    const tname = params.get("therapistName")
    const cname = params.get("patientName")
    const temail = params.get("therapistEmail")
    const cemail = params.get("patientEmail")


    const commonQueryParams={
        patientPhoto : clientPhoto,
        therapistPhoto,
        patientName : cname,
        therapistName : tname,
        therapistEmail: temail,
        patientEmail : cemail
        
    }

    const skills =
        JSON.parse(
            decodeURIComponent(params.get("skills") || "[]")
        );


    const onContactSupport = () => {
        try {
            window.open('https://mail.google.com/mail/?view=cm&fs=1&to=support@elma.ltd');
        } catch (error) {
            console.error('Failed to open mail app:', error);
            alert('Unable to open mail app.');
        }
    };

    // Construct the dynamic session link for the QR code
    const sessionLink =
        `https://elma.ltd/session-join?` +
        `sessionCode=${encodeURIComponent(sessionCode || '')}` +
        `&userId=${encodeURIComponent(userId || '')}` +
        `&role=${encodeURIComponent(role || '')}` +
        `&name=${encodeURIComponent(name || '')}` +
        `&skills=${encodeURIComponent(JSON.stringify(skills))}` + // Ensure skills array is stringified and encoded
        `&profession=${encodeURIComponent(profession || '')}` +
        `&startTime=${encodeURIComponent(startTime || '')}` +
        `&email=${encodeURIComponent(email || '')}` +
        `&photo=${encodeURIComponent(photo || '')}` + `&patientName=${encodeURIComponent(commonQueryParams.patientName || "")}` +
        `&patientPhoto=${encodeURIComponent(commonQueryParams.patientPhoto || "")}` +
        `&patientEmail=${encodeURIComponent(commonQueryParams.patientEmail || "")}` +

        `&therapistName=${encodeURIComponent(commonQueryParams.therapistName || "")}` +
        `&therapistPhoto=${encodeURIComponent(commonQueryParams.therapistPhoto || "")}` +
        `&therapistEmail=${encodeURIComponent(commonQueryParams.therapistEmail || "")}`;

    // Note: commonQueryParams was undefined in the provided context and has been removed for a functional solution.
    // If commonQueryParams are needed, they should be defined or extracted from useSearchParams similarly.

    return (
        <SessionPage/>
    );
};

export default QRPage;