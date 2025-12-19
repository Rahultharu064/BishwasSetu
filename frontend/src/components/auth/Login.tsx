import { useDispatch } from "react-redux";
import { login } from "../../Redux/slices/authSlice";

export default function Login() {
  const dispatch = useDispatch<any>();

  const submitHandler = (e: any) => {
    e.preventDefault();
    dispatch(login({
      identifier: e.target.email.value,
      password: e.target.password.value,
    }));
  };

  return (
    <form onSubmit={submitHandler}>
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
