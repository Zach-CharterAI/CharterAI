import SearchComponent from "../components/SearchComponent";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomePage = () => {
  return (
    <div className="bg-white h-screen flex items-center justify-center">
      <ToastContainer/>
      <SearchComponent />
    </div>
  );
};

export default HomePage;
