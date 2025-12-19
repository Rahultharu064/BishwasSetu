import { useDispatch } from "react-redux";
import { register } from "../../Redux/slices/authSlice";

export default function Register() {
  const dispatch = useDispatch<any>();

  const submitHandler = (e: any) => {
    e.preventDefault();
    dispatch(register({
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      password: e.target.password.value,
      role: "CUSTOMER",
    }));
  };

  return (
    <form onSubmit={submitHandler}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <input name="phone" placeholder="Phone" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
}
