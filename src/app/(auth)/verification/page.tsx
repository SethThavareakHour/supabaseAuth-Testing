import OtpVerification from "@/components/OtpVerification";

export default function OtpVerificationPage() {
  return (
    <>
      <div className="w-full flex mt-20 justify-center">
        <section className="flex flex-col w-[400px]">
          <h1 className="text-3xl w-full text-center font-bold mb-6">
            Enter Verification Number
          </h1>
          <OtpVerification />
        </section>
      </div>
    </>
  );
}