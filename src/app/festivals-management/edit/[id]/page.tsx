import FestivalForm from "@/features/festivals/FestivalForm"

export default async function EditFestivalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <FestivalForm festivalId={id} />
}
