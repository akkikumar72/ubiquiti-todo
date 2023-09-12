import NavbarUser from "./NavbarUser";
import { twMerge } from "tailwind-merge";
import { FcTodoList } from "react-icons/fc";

interface Props {
  className?: string;
}

const Navbar = ({ className }: Props) => {
  return (
    <nav
      className={twMerge(
        "flex grid-cols-3 items-center justify-between p-4 md:grid md:p-8",
        "grid-cols-2",
        className,
      )}
    >
      <FcTodoList size={50} />
      <NavbarUser />
    </nav>
  );
};

export default Navbar;
