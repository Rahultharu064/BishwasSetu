import { useDispatch, useSelector } from "react-redux";
import { verifyOTP } from "../../Redux/slices/authSlice";
import type { RootState } from "../../Redux/store";

export default function VerifyOtp() {
  const dispatch = useDispatch<any>();
  const userId = useSelector((state: RootState) => state.auth.userId);

  const submitHandler = (e: any) => {
    e.preventDefault();
    dispatch(verifyOTP({
      userId,
      otp: e.target.otp.value,
    }));
  };

  return (
    <form onSubmit={submitHandler}>
      <input name="otp" placeholder="Enter OTP" />
      <button type="submit">Verify OTP</button>
    </form>
  );
}
