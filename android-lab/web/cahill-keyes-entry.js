// Offline D3 build entry for the *actual* Cahill-Keyes 1975 projection.
// Bundled with pinned D3 dependencies by scripts/build_cahill_keyes_vendor.sh.
// The browser never fetches scripts or geographic data over the network.
import {geoCahillKeyes} from "d3-geo-polygon";
import {geoPath,geoGraticule10} from "d3-geo";
window.labCahillD3=Object.freeze({geoCahillKeyes,geoPath,geoGraticule10});
