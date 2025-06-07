import { AdminMiddlewareClient } from "../(middleware)/AdminMiddlewareClient";
import Componentspage from "../../features/dashboard/components/componentspage";

export default async function Page() {
  await AdminMiddlewareClient();

  return (
    <div className="flex flex-col md:flex-row justify-center gap-4">
      <Componentspage />
    </div>
  );
}
