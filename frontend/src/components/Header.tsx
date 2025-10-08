import { Link, NavLink } from "react-router";

const Header = () => {
  return (
    <header className="flex flex-row justify-between items-center bg-stone-600 md:px-8 md:py-4 px-3 py-2 md:text-lg">
      <div className="flex justify-between items-center w-4xl mx-auto">
        <div>
          <Link to={"/"}>
            <h1>Kube Credential</h1>
          </Link>
        </div>
        <div className="flex gap-5 justify-center">
          <div className="hover:underline">
            <NavLink
              to={"/"}
              className={({ isActive }) =>
                isActive ? "text-neutral-300" : "text-white"
              }
            >
              Generate
            </NavLink>
          </div>

          <div className="hover:underline">
            <NavLink
              to={"/check"}
              className={({ isActive }) =>
                isActive ? "text-neutral-300" : "text-white"
              }
            >
              Check
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
