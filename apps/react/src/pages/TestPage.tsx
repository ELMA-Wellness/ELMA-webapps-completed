const TestPage=()=>{

    return (
        <button
  onClick={async () => {
    try {
      const audio = new Audio(
        "https://res.cloudinary.com/dnzy9hf2x/video/upload/v1781151964/app-sounds_2Fcall_start_psmzhm.mp3"
      );

      await audio.play();

      alert("SUCCESS");
    } catch (e) {
      alert(`FAILED: ${(e as Error).message}`);
    }
  }}
>
  TEST AUDIO
</button>
    )

}
export default TestPage;