import { http } from "@/api/http";

export async function getAttractionList() {
  const { data } = await http.get("/rides");
  return data;
}

export async function getAttractionDetail(attractionId: number | string) {
  const { data } = await http.get(`/rides/${attractionId}`);
  return data;
}
