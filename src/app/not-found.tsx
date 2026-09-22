import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center dark:bg-stone-950">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
        <PackageSearch className="h-8 w-8 text-stone-400" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
        Page not found
      </h1>
      <p className="max-w-md text-stone-600 dark:text-stone-400">
        The page or product you are looking for may have been moved or removed.
        Browse the shop for more world flavours instead.
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-11 rounded-full bg-emerald-700 px-6 font-semibold text-white hover:bg-emerald-800">
          <Link href="/shop">Go to the shop</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-stone-300 px-6 font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
