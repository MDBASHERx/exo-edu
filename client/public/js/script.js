// Disable Developer Tools & View Source
document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "f12" || (e.ctrlKey && e.shiftKey && key === "i") || (e.ctrlKey && key === "u"))
    {
        e.preventDefault();
    }
});

// Disable Right Click
// document.addEventListener("contextmenu", (e) => e.preventDefault());