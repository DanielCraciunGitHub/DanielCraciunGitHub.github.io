import { FC } from "react"
import { notFound } from "next/navigation"
import { examBoards, subjects, levels } from "@/app/lib/constants"
import supabase from "@/app/lib/supabase"
import ResourceLinks from "./ResourceLinks"
import { Metadata } from "next"

// caches the downloaded pages and requests new data every 20 seconds
export const revalidate = 20

interface pageProps {
  params: { Resource: string[] }
}

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const path = params.Resource.join("/")
  const { data } = await supabase.storage.from("files").list(path)
  // if there is no data at this page
  if (!data?.length) {
    return {
      title: "Not Found",
      description: "This resource is not available at the moment",
    }
  }
  // if the page is available
  return {
    title:
      params.Resource[0] +
      " | " +
      params.Resource[1] +
      " | " +
      params.Resource[2],
    description: `This is a resource for ${params.Resource[0]} ${params.Resource[1]} and the exam board is ${params.Resource[2]}`,
  }
}

const page: FC<pageProps> = async ({ params }) => {
  const path = params.Resource.join("/")
  // gets all of the files from the user's requested path
  const { data } = await supabase.storage.from("files").list(path)

  if (data?.length) {
    // only look for pdf files
    const filteredData = data.filter(
      (file) => file.metadata.mimetype === "application/pdf"
    )
    // create an array of the file names, and send this to a child component along
    // with the path name for reference
    const names: string[] = filteredData.map((file) => file.name)

    // from all of the names, organise into three categories, worksheets, answers, extra
    const worksheets: string[] = names.filter((name) =>
      name.includes("worksheet")
    )
    const answers: string[] = names.filter((name) => name.includes("answer"))
    const extra: string[] = names.filter(
      (name) => !name.includes("worksheet") && !name.includes("answer")
    )

    return (
      <div className="md:grid md:grid-cols-3 md:gap-8 md:items-end flex flex-col space-y-4 items-center">
        <ResourceLinks names={worksheets} path={path} title="Worksheets" />
        <ResourceLinks names={answers} path={path} title="Answers" />
        <ResourceLinks names={extra} path={path} title="Extra Links" />
      </div>
    )
  } else {
    notFound()
  }
}
// NOTE: Make this an async function later on to not rely on /lib/constants.ts
export function generateStaticParams() {
  const combinations = []

  for (const level of levels) {
    for (const subject of subjects) {
      for (const examBoard of examBoards) {
        combinations.push({ Resource: [level, subject, examBoard] })
      }
    }
  }
  return combinations
}
export default page
