"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";

export interface GNode { id: string; nameEn: string; nameHi: string | null; type: string; overallTier: string | null; isSubject: boolean; adverse: boolean; }
export interface GLink { source: string; target: string; type: string; id: string; }

export function NetworkGraph({ nodes, links, lang, focus }: { nodes: GNode[]; links: GLink[]; lang: string; focus?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const router = useRouter();

  useEffect(() => {
    const svg = d3.select(ref.current!);
    svg.selectAll("*").remove();
    const width = ref.current!.clientWidth || 960;
    const height = Math.max(520, Math.min(760, nodes.length * 26));
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    type N = GNode & d3.SimulationNodeDatum;
    type L = d3.SimulationLinkDatum<N> & { type: string };
    const ns: N[] = nodes.map((n) => ({ ...n }));
    const ls: L[] = links.map((l) => ({ ...l }));

    const sim = d3.forceSimulation(ns)
      .force("link", d3.forceLink<N, L>(ls).id((d) => d.id).distance(110).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-260))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(28));

    const g = svg.append("g");
    const link = g.append("g").selectAll("line").data(ls).join("line")
      .attr("stroke", "#c8c8c8").attr("stroke-width", 1);
    const linkLabel = g.append("g").selectAll("text").data(ls).join("text")
      .text((d) => d.type.replace(/_/g, " ")).attr("font-size", 9).attr("fill", "#a3a3a3").attr("text-anchor", "middle");

    const node = g.append("g").selectAll<SVGGElement, N>("g").data(ns).join("g")
      .style("cursor", "pointer")
      .on("click", (_, d) => { router.push(`/${lang}/records/${d.id}`); });
    node.append("circle")
      .attr("r", (d) => (d.isSubject ? 9 : 6))
      .attr("fill", (d) => (d.adverse ? "#111" : "#fff"))
      .attr("stroke", (d) => (d.id === focus ? "#111" : d.adverse ? "#111" : "#8a8a8a"))
      .attr("stroke-width", (d) => (d.id === focus ? 3 : 1))
      .attr("stroke-dasharray", (d) => (d.overallTier === "allegation" ? "2 2" : null));
    node.append("text")
      .text((d) => (lang === "hi" && d.nameHi ? d.nameHi : d.nameEn))
      .attr("x", 13).attr("y", 4).attr("font-size", 11).attr("fill", "#111");

    node.call(d3.drag<SVGGElement, N>()
      .on("start", (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
      .on("end", (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.4, 3]).on("zoom", (ev) => g.attr("transform", ev.transform)));

    sim.on("tick", () => {
      link.attr("x1", (d) => (d.source as N).x!).attr("y1", (d) => (d.source as N).y!)
          .attr("x2", (d) => (d.target as N).x!).attr("y2", (d) => (d.target as N).y!);
      linkLabel.attr("x", (d) => ((d.source as N).x! + (d.target as N).x!) / 2)
               .attr("y", (d) => ((d.source as N).y! + (d.target as N).y!) / 2 - 4);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
    return () => { sim.stop(); };
  }, [nodes, links, lang, focus, router]);

  return <svg ref={ref} className="w-full border hair" style={{ height: "min(70vh, 760px)" }} role="img" aria-label="relationship graph" />;
}
