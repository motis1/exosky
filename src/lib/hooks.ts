import { useEffect, useState } from "react";

export function useTextCycle(targetString: string, duration = 1000) {
    const [displayedString, setDisplayedString] = useState("");
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        let index = 0;

        // Initialize with fully obfuscated text
        setDisplayedString(
            Array(targetString.length)
                .fill(0)
                .map(
                    () =>
                        characters[
                            Math.floor(Math.random() * characters.length)
                        ]
                )
                .join("")
        );

        const revealNextCharacter = () => {
            if (index < targetString.length) {
                setDisplayedString((prevString) => {
                    return (
                        targetString.slice(0, index + 1) +
                        prevString.slice(index + 1)
                    );
                });
                index++;
            } else {
                clearInterval(intervalId);
            }
        };

        intervalId = setInterval(
            revealNextCharacter,
            duration / targetString.length
        );

        return () => clearInterval(intervalId);
    }, [targetString, duration]);

    return displayedString;
}
