import { Vec2 } from './math';

export interface KrasResidue3D {
  seq: number;
  comp: string;
  x: number;
  y: number;
  z: number;
  plddt: number;
}

export interface ProjectedResidue2D {
  seq: number;
  comp: string;
  screenX: number;
  screenY: number;
  depthZ: number;
  plddt: number;
  domain: 'p_loop_g12c' | 'switch_i' | 'switch_ii_pocket' | 'hvr_tail' | 'core';
}

/**
 * Authentic 189 C-alpha atomic coordinates and per-residue AlphaFold pLDDT scores
 * extracted from Human GTPase KRas (UniProt: P01116, AF-P01116-F1-model_v6.cif).
 * Global pLDDT: 91.50 | Rigid Composite Core: Residues 1–175 | Disordered HVR Tail: 176–189.
 */
export const KRAS_P01116_CA: readonly KrasResidue3D[] = [
  { seq: 1, comp: 'MET', x: -15.3, y: 12.1, z: 11.5, plddt: 85.3 },
  { seq: 2, comp: 'THR', x: -14.1, y: 8.5, z: 10.9, plddt: 95.7 },
  { seq: 3, comp: 'GLU', x: -10.3, y: 7.9, z: 11.1, plddt: 97.9 },
  { seq: 4, comp: 'TYR', x: -8.6, y: 5.1, z: 9.0, plddt: 98.5 },
  { seq: 5, comp: 'LYS', x: -5.0, y: 4.0, z: 9.9, plddt: 98.2 },
  { seq: 6, comp: 'LEU', x: -3.4, y: 3.0, z: 6.6, plddt: 98.6 },
  { seq: 7, comp: 'VAL', x: 0.1, y: 1.4, z: 6.3, plddt: 98.1 },
  { seq: 8, comp: 'VAL', x: 2.1, y: 1.4, z: 3.1, plddt: 98.0 },
  { seq: 9, comp: 'VAL', x: 4.4, y: -1.8, z: 3.0, plddt: 96.9 },
  { seq: 10, comp: 'GLY', x: 6.7, y: -3.2, z: 0.3, plddt: 97.0 },
  { seq: 11, comp: 'ALA', x: 10.4, y: -3.5, z: -0.7, plddt: 95.3 },
  { seq: 12, comp: 'GLY', x: 13.0, y: -0.7, z: -1.0, plddt: 93.9 },
  { seq: 13, comp: 'GLY', x: 12.6, y: 1.7, z: -4.0, plddt: 94.1 },
  { seq: 14, comp: 'VAL', x: 9.0, y: 0.5, z: -5.0, plddt: 97.0 },
  { seq: 15, comp: 'GLY', x: 7.7, y: 4.1, z: -4.6, plddt: 96.9 },
  { seq: 16, comp: 'LYS', x: 5.7, y: 3.9, z: -1.2, plddt: 97.4 },
  { seq: 17, comp: 'SER', x: 6.7, y: 7.4, z: -0.3, plddt: 96.1 },
  { seq: 18, comp: 'ALA', x: 6.1, y: 8.7, z: -3.8, plddt: 96.8 },
  { seq: 19, comp: 'LEU', x: 2.5, y: 7.3, z: -3.7, plddt: 98.0 },
  { seq: 20, comp: 'THR', x: 1.9, y: 8.8, z: -0.2, plddt: 97.1 },
  { seq: 21, comp: 'ILE', x: 3.4, y: 12.2, z: -1.1, plddt: 95.6 },
  { seq: 22, comp: 'GLN', x: 1.5, y: 12.2, z: -4.5, plddt: 97.2 },
  { seq: 23, comp: 'LEU', x: -1.7, y: 11.5, z: -2.5, plddt: 97.2 },
  { seq: 24, comp: 'ILE', x: -1.0, y: 14.1, z: 0.2, plddt: 95.6 },
  { seq: 25, comp: 'GLN', x: 0.7, y: 17.0, z: -1.7, plddt: 93.2 },
  { seq: 26, comp: 'ASN', x: -0.2, y: 16.3, z: -5.4, plddt: 93.4 },
  { seq: 27, comp: 'HIS', x: 3.6, y: 16.3, z: -6.0, plddt: 91.5 },
  { seq: 28, comp: 'PHE', x: 6.1, y: 13.8, z: -7.4, plddt: 90.7 },
  { seq: 29, comp: 'VAL', x: 9.6, y: 13.7, z: -5.9, plddt: 81.4 },
  { seq: 30, comp: 'ASP', x: 12.0, y: 12.2, z: -8.5, plddt: 81.6 },
  { seq: 31, comp: 'GLU', x: 14.9, y: 11.9, z: -6.0, plddt: 84.1 },
  { seq: 32, comp: 'TYR', x: 15.2, y: 8.7, z: -4.0, plddt: 77.8 },
  { seq: 33, comp: 'ASP', x: 15.8, y: 9.2, z: -0.3, plddt: 83.3 },
  { seq: 34, comp: 'PRO', x: 15.3, y: 5.9, z: 1.7, plddt: 84.6 },
  { seq: 35, comp: 'THR', x: 12.5, y: 6.4, z: 4.2, plddt: 82.0 },
  { seq: 36, comp: 'ILE', x: 12.8, y: 5.3, z: 7.8, plddt: 81.6 },
  { seq: 37, comp: 'GLU', x: 9.2, y: 6.0, z: 8.9, plddt: 84.4 },
  { seq: 38, comp: 'ASP', x: 6.9, y: 9.0, z: 8.2, plddt: 91.9 },
  { seq: 39, comp: 'SER', x: 3.3, y: 9.7, z: 9.2, plddt: 93.4 },
  { seq: 40, comp: 'TYR', x: 0.9, y: 11.8, z: 7.1, plddt: 96.2 },
  { seq: 41, comp: 'ARG', x: -2.7, y: 13.0, z: 7.6, plddt: 96.9 },
  { seq: 42, comp: 'LYS', x: -5.3, y: 14.0, z: 5.0, plddt: 96.8 },
  { seq: 43, comp: 'GLN', x: -9.0, y: 14.8, z: 5.3, plddt: 97.9 },
  { seq: 44, comp: 'VAL', x: -10.8, y: 13.4, z: 2.2, plddt: 97.6 },
  { seq: 45, comp: 'VAL', x: -14.4, y: 12.5, z: 1.0, plddt: 98.0 },
  { seq: 46, comp: 'ILE', x: -14.7, y: 8.8, z: 0.1, plddt: 97.9 },
  { seq: 47, comp: 'ASP', x: -18.1, y: 7.7, z: -1.2, plddt: 97.4 },
  { seq: 48, comp: 'GLY', x: -19.8, y: 10.9, z: 0.2, plddt: 97.1 },
  { seq: 49, comp: 'GLU', x: -18.3, y: 10.3, z: 3.8, plddt: 96.8 },
  { seq: 50, comp: 'THR', x: -15.8, y: 12.8, z: 5.2, plddt: 97.9 },
  { seq: 51, comp: 'CYS', x: -12.9, y: 10.9, z: 6.8, plddt: 98.2 },
  { seq: 52, comp: 'LEU', x: -9.3, y: 11.3, z: 8.0, plddt: 98.4 },
  { seq: 53, comp: 'LEU', x: -6.6, y: 9.1, z: 6.5, plddt: 98.4 },
  { seq: 54, comp: 'ASP', x: -3.7, y: 8.5, z: 8.9, plddt: 98.1 },
  { seq: 55, comp: 'ILE', x: -1.0, y: 7.1, z: 6.6, plddt: 98.2 },
  { seq: 56, comp: 'LEU', x: 2.2, y: 5.5, z: 7.8, plddt: 96.9 },
  { seq: 57, comp: 'ASP', x: 4.9, y: 5.3, z: 5.1, plddt: 94.6 },
  { seq: 58, comp: 'THR', x: 7.5, y: 2.7, z: 6.1, plddt: 93.4 },
  { seq: 59, comp: 'ALA', x: 11.1, y: 1.7, z: 5.4, plddt: 89.4 },
  { seq: 60, comp: 'GLY', x: 11.4, y: -0.9, z: 2.6, plddt: 79.8 },
  { seq: 61, comp: 'GLN', x: 14.8, y: -2.1, z: 3.8, plddt: 79.1 },
  { seq: 62, comp: 'GLU', x: 15.6, y: -5.3, z: 5.9, plddt: 76.4 },
  { seq: 63, comp: 'GLU', x: 17.6, y: -3.3, z: 8.5, plddt: 78.8 },
  { seq: 64, comp: 'TYR', x: 14.3, y: -1.9, z: 9.8, plddt: 76.8 },
  { seq: 65, comp: 'SER', x: 12.6, y: -5.4, z: 10.0, plddt: 73.1 },
  { seq: 66, comp: 'ALA', x: 12.4, y: -5.2, z: 13.9, plddt: 77.6 },
  { seq: 67, comp: 'MET', x: 9.9, y: -2.1, z: 13.6, plddt: 79.8 },
  { seq: 68, comp: 'ARG', x: 7.5, y: -4.0, z: 11.2, plddt: 84.8 },
  { seq: 69, comp: 'ASP', x: 5.5, y: -5.7, z: 13.9, plddt: 89.6 },
  { seq: 70, comp: 'GLN', x: 4.7, y: -2.4, z: 15.6, plddt: 89.8 },
  { seq: 71, comp: 'TYR', x: 3.1, y: -0.7, z: 12.6, plddt: 90.4 },
  { seq: 72, comp: 'MET', x: 1.4, y: -4.0, z: 11.5, plddt: 92.6 },
  { seq: 73, comp: 'ARG', x: -0.3, y: -4.1, z: 15.0, plddt: 94.6 },
  { seq: 74, comp: 'THR', x: -1.6, y: -0.5, z: 14.7, plddt: 92.9 },
  { seq: 75, comp: 'GLY', x: -2.6, y: -0.4, z: 10.9, plddt: 96.7 },
  { seq: 76, comp: 'GLU', x: -6.3, y: -1.1, z: 10.0, plddt: 97.9 },
  { seq: 77, comp: 'GLY', x: -5.4, y: -1.8, z: 6.4, plddt: 98.6 },
  { seq: 78, comp: 'PHE', x: -2.3, y: -2.3, z: 4.2, plddt: 98.7 },
  { seq: 79, comp: 'LEU', x: -1.2, y: -1.2, z: 0.8, plddt: 98.8 },
  { seq: 80, comp: 'CYS', x: 1.2, y: -4.0, z: -0.4, plddt: 98.6 },
  { seq: 81, comp: 'VAL', x: 3.3, y: -2.2, z: -3.0, plddt: 98.8 },
  { seq: 82, comp: 'PHE', x: 5.6, y: -3.7, z: -5.6, plddt: 98.8 },
  { seq: 83, comp: 'ALA', x: 7.1, y: -2.1, z: -8.7, plddt: 98.6 },
  { seq: 84, comp: 'ILE', x: 6.1, y: -3.6, z: -12.1, plddt: 98.6 },
  { seq: 85, comp: 'ASN', x: 9.7, y: -3.3, z: -13.3, plddt: 98.4 },
  { seq: 86, comp: 'ASN', x: 11.1, y: -5.3, z: -10.3, plddt: 98.0 },
  { seq: 87, comp: 'THR', x: 10.3, y: -9.0, z: -10.1, plddt: 98.2 },
  { seq: 88, comp: 'LYS', x: 12.0, y: -9.5, z: -6.6, plddt: 97.9 },
  { seq: 89, comp: 'SER', x: 9.7, y: -6.7, z: -5.2, plddt: 98.1 },
  { seq: 90, comp: 'PHE', x: 6.7, y: -8.7, z: -6.4, plddt: 98.6 },
  { seq: 91, comp: 'GLU', x: 8.0, y: -12.0, z: -4.9, plddt: 97.8 },
  { seq: 92, comp: 'ASP', x: 8.5, y: -10.2, z: -1.6, plddt: 97.0 },
  { seq: 93, comp: 'ILE', x: 4.7, y: -9.4, z: -1.3, plddt: 98.1 },
  { seq: 94, comp: 'HIS', x: 4.2, y: -12.9, z: 0.0, plddt: 97.2 },
  { seq: 95, comp: 'HIS', x: 6.5, y: -12.2, z: 3.0, plddt: 94.9 },
  { seq: 96, comp: 'TYR', x: 4.8, y: -8.8, z: 3.8, plddt: 95.6 },
  { seq: 97, comp: 'ARG', x: 1.4, y: -10.5, z: 3.7, plddt: 96.7 },
  { seq: 98, comp: 'GLU', x: 2.3, y: -13.4, z: 5.9, plddt: 95.8 },
  { seq: 99, comp: 'GLN', x: 3.9, y: -11.1, z: 8.4, plddt: 94.3 },
  { seq: 100, comp: 'ILE', x: 0.8, y: -8.8, z: 8.5, plddt: 96.7 },
  { seq: 101, comp: 'LYS', x: -1.5, y: -11.9, z: 9.0, plddt: 96.8 },
  { seq: 102, comp: 'ARG', x: 0.8, y: -13.2, z: 11.8, plddt: 95.9 },
  { seq: 103, comp: 'VAL', x: 0.8, y: -9.8, z: 13.6, plddt: 95.4 },
  { seq: 104, comp: 'LYS', x: -3.0, y: -9.3, z: 13.2, plddt: 95.6 },
  { seq: 105, comp: 'ASP', x: -3.8, y: -12.9, z: 14.2, plddt: 95.7 },
  { seq: 106, comp: 'SER', x: -6.2, y: -12.9, z: 11.2, plddt: 94.5 },
  { seq: 107, comp: 'GLU', x: -6.7, y: -14.3, z: 7.7, plddt: 93.8 },
  { seq: 108, comp: 'ASP', x: -9.2, y: -11.5, z: 6.8, plddt: 93.4 },
  { seq: 109, comp: 'VAL', x: -7.0, y: -8.4, z: 7.1, plddt: 97.6 },
  { seq: 110, comp: 'PRO', x: -7.9, y: -5.4, z: 4.8, plddt: 98.6 },
  { seq: 111, comp: 'MET', x: -5.3, y: -5.2, z: 2.0, plddt: 98.8 },
  { seq: 112, comp: 'VAL', x: -4.8, y: -3.9, z: -1.5, plddt: 98.9 },
  { seq: 113, comp: 'LEU', x: -2.1, y: -5.2, z: -3.9, plddt: 98.9 },
  { seq: 114, comp: 'VAL', x: -0.4, y: -2.2, z: -5.7, plddt: 98.9 },
  { seq: 115, comp: 'GLY', x: 1.7, y: -2.5, z: -8.9, plddt: 98.9 },
  { seq: 116, comp: 'ASN', x: 3.4, y: 0.8, z: -9.0, plddt: 98.8 },
  { seq: 117, comp: 'LYS', x: 5.5, y: 2.5, z: -11.8, plddt: 98.1 },
  { seq: 118, comp: 'CYS', x: 3.0, y: 1.4, z: -14.5, plddt: 98.2 },
  { seq: 119, comp: 'ASP', x: 4.4, y: 4.4, z: -16.6, plddt: 97.8 },
  { seq: 120, comp: 'LEU', x: 7.7, y: 2.6, z: -17.2, plddt: 96.8 },
  { seq: 121, comp: 'PRO', x: 8.3, y: 0.5, z: -20.4, plddt: 96.0 },
  { seq: 122, comp: 'SER', x: 10.6, y: -1.9, z: -18.6, plddt: 96.4 },
  { seq: 123, comp: 'ARG', x: 7.8, y: -4.1, z: -17.2, plddt: 98.1 },
  { seq: 124, comp: 'THR', x: 9.1, y: -7.5, z: -15.7, plddt: 98.1 },
  { seq: 125, comp: 'VAL', x: 5.8, y: -8.4, z: -13.9, plddt: 98.1 },
  { seq: 126, comp: 'ASP', x: 2.8, y: -9.1, z: -16.1, plddt: 97.2 },
  { seq: 127, comp: 'THR', x: -0.6, y: -7.6, z: -15.1, plddt: 97.7 },
  { seq: 128, comp: 'LYS', x: -2.1, y: -11.1, z: -15.3, plddt: 98.1 },
  { seq: 129, comp: 'GLN', x: 0.5, y: -12.5, z: -12.8, plddt: 97.8 },
  { seq: 130, comp: 'ALA', x: -0.3, y: -9.7, z: -10.3, plddt: 98.5 },
  { seq: 131, comp: 'GLN', x: -4.1, y: -10.2, z: -10.9, plddt: 98.6 },
  { seq: 132, comp: 'ASP', x: -3.9, y: -14.0, z: -10.3, plddt: 98.6 },
  { seq: 133, comp: 'LEU', x: -1.9, y: -13.3, z: -7.1, plddt: 98.4 },
  { seq: 134, comp: 'ALA', x: -4.4, y: -10.8, z: -5.8, plddt: 98.7 },
  { seq: 135, comp: 'ARG', x: -7.2, y: -13.3, z: -6.6, plddt: 98.4 },
  { seq: 136, comp: 'SER', x: -5.4, y: -16.1, z: -4.7, plddt: 97.9 },
  { seq: 137, comp: 'TYR', x: -5.2, y: -13.7, z: -1.7, plddt: 97.9 },
  { seq: 138, comp: 'GLY', x: -8.8, y: -12.5, z: -2.1, plddt: 97.9 },
  { seq: 139, comp: 'ILE', x: -7.8, y: -8.8, z: -2.3, plddt: 98.6 },
  { seq: 140, comp: 'PRO', x: -8.1, y: -5.9, z: -4.8, plddt: 98.8 },
  { seq: 141, comp: 'PHE', x: -5.3, y: -5.2, z: -7.4, plddt: 98.8 },
  { seq: 142, comp: 'ILE', x: -4.5, y: -1.7, z: -8.7, plddt: 98.8 },
  { seq: 143, comp: 'GLU', x: -1.8, y: -0.6, z: -11.1, plddt: 98.8 },
  { seq: 144, comp: 'THR', x: -0.5, y: 2.9, z: -10.2, plddt: 98.8 },
  { seq: 145, comp: 'SER', x: 2.0, y: 5.5, z: -11.3, plddt: 98.4 },
  { seq: 146, comp: 'ALA', x: 3.1, y: 7.9, z: -8.6, plddt: 98.0 },
  { seq: 147, comp: 'LYS', x: 4.8, y: 9.8, z: -11.4, plddt: 97.4 },
  { seq: 148, comp: 'THR', x: 1.7, y: 10.4, z: -13.5, plddt: 97.2 },
  { seq: 149, comp: 'ARG', x: -0.7, y: 10.3, z: -10.5, plddt: 97.4 },
  { seq: 150, comp: 'GLN', x: -2.5, y: 7.4, z: -12.3, plddt: 98.5 },
  { seq: 151, comp: 'ARG', x: -4.9, y: 5.7, z: -9.9, plddt: 98.4 },
  { seq: 152, comp: 'VAL', x: -3.0, y: 6.9, z: -6.7, plddt: 98.5 },
  { seq: 153, comp: 'GLU', x: -6.3, y: 8.0, z: -5.1, plddt: 98.1 },
  { seq: 154, comp: 'ASP', x: -8.1, y: 4.7, z: -6.2, plddt: 98.6 },
  { seq: 155, comp: 'ALA', x: -5.4, y: 2.6, z: -4.3, plddt: 98.8 },
  { seq: 156, comp: 'PHE', x: -5.9, y: 4.4, z: -1.0, plddt: 98.7 },
  { seq: 157, comp: 'TYR', x: -9.7, y: 4.8, z: -1.4, plddt: 98.6 },
  { seq: 158, comp: 'THR', x: -10.1, y: 1.1, z: -2.3, plddt: 98.8 },
  { seq: 159, comp: 'LEU', x: -8.2, y: 0.2, z: 0.9, plddt: 98.9 },
  { seq: 160, comp: 'VAL', x: -10.7, y: 2.4, z: 2.9, plddt: 98.8 },
  { seq: 161, comp: 'ARG', x: -13.6, y: 0.4, z: 1.3, plddt: 98.7 },
  { seq: 162, comp: 'GLU', x: -11.9, y: -2.9, z: 2.3, plddt: 98.6 },
  { seq: 163, comp: 'ILE', x: -11.6, y: -1.6, z: 6.0, plddt: 98.5 },
  { seq: 164, comp: 'ARG', x: -15.3, y: -0.5, z: 5.9, plddt: 97.9 },
  { seq: 165, comp: 'GLN', x: -16.3, y: -4.0, z: 4.6, plddt: 97.1 },
  { seq: 166, comp: 'TYR', x: -14.2, y: -5.7, z: 7.3, plddt: 96.7 },
  { seq: 167, comp: 'ARG', x: -15.7, y: -3.6, z: 10.1, plddt: 95.2 },
  { seq: 168, comp: 'LEU', x: -19.3, y: -4.4, z: 8.8, plddt: 93.8 },
  { seq: 169, comp: 'LYS', x: -18.5, y: -8.2, z: 8.7, plddt: 92.0 },
  { seq: 170, comp: 'LYS', x: -17.1, y: -8.0, z: 12.3, plddt: 88.7 },
  { seq: 171, comp: 'ILE', x: -20.3, y: -6.3, z: 13.7, plddt: 87.9 },
  { seq: 172, comp: 'SER', x: -22.5, y: -8.9, z: 11.9, plddt: 84.4 },
  { seq: 173, comp: 'LYS', x: -20.6, y: -11.8, z: 13.6, plddt: 79.5 },
  { seq: 174, comp: 'GLU', x: -20.9, y: -10.3, z: 17.1, plddt: 76.6 },
  { seq: 175, comp: 'GLU', x: -24.7, y: -9.8, z: 16.7, plddt: 71.3 },
  { seq: 176, comp: 'LYS', x: -25.0, y: -13.5, z: 15.6, plddt: 64.3 },
  { seq: 177, comp: 'THR', x: -23.6, y: -14.7, z: 19.0, plddt: 54.0 },
  { seq: 178, comp: 'PRO', x: -26.5, y: -14.4, z: 21.5, plddt: 48.2 },
  { seq: 179, comp: 'GLY', x: -24.9, y: -14.6, z: 25.0, plddt: 49.5 },
  { seq: 180, comp: 'CYS', x: -23.9, y: -17.7, z: 26.8, plddt: 45.2 },
  { seq: 181, comp: 'VAL', x: -24.4, y: -16.0, z: 30.1, plddt: 50.3 },
  { seq: 182, comp: 'LYS', x: -22.6, y: -18.5, z: 32.4, plddt: 49.0 },
  { seq: 183, comp: 'ILE', x: -24.8, y: -18.3, z: 35.5, plddt: 54.0 },
  { seq: 184, comp: 'LYS', x: -22.3, y: -19.1, z: 38.3, plddt: 52.2 },
  { seq: 185, comp: 'LYS', x: -24.7, y: -20.3, z: 41.1, plddt: 51.4 },
  { seq: 186, comp: 'CYS', x: -22.9, y: -19.2, z: 44.2, plddt: 52.3 },
  { seq: 187, comp: 'ILE', x: -24.8, y: -21.1, z: 47.0, plddt: 59.4 },
  { seq: 188, comp: 'ILE', x: -23.9, y: -19.3, z: 50.2, plddt: 52.9 },
  { seq: 189, comp: 'MET', x: -25.0, y: -21.2, z: 53.3, plddt: 52.3 },
];

export function classifyKrasDomain(
  seq: number
): 'p_loop_g12c' | 'switch_i' | 'switch_ii_pocket' | 'hvr_tail' | 'core' {
  if (seq >= 10 && seq <= 17) return 'p_loop_g12c';
  if (seq >= 30 && seq <= 38) return 'switch_i';
  if (seq >= 58 && seq <= 72) return 'switch_ii_pocket';
  if (seq >= 176) return 'hvr_tail';
  return 'core';
}

/**
 * Standard AlphaFold pLDDT confidence color scale + combat domain highlights.
 */
export function getPlddtColor(plddt: number): string {
  if (plddt >= 90) return '#0053d6'; // Very High (>=90)
  if (plddt >= 70) return '#65cbf3'; // Confident (70-90)
  if (plddt >= 50) return '#ffdb13'; // Low (50-70)
  return '#ff7d45'; // Very Low / Disordered (<50)
}

export function getDomainHighlightColor(
  domain: ProjectedResidue2D['domain'],
  plddt: number
): string {
  if (domain === 'p_loop_g12c') return '#00f2fe';
  if (domain === 'switch_ii_pocket') return '#ff6a00';
  if (domain === 'switch_i') return '#b721ff';
  if (domain === 'hvr_tail') return '#facc15';
  return getPlddtColor(plddt);
}

/**
 * Projects all 189 KRAS C-alpha residues into 2D arena/canvas coordinates
 * with 3D Euler rotation (yaw, pitch, roll) and perspective depth scaling.
 */
export function projectKrasBackbone(
  center: Vec2,
  scale: number,
  yaw: number,
  pitch: number,
  roll = 0,
  whipPhase = 0
): ProjectedResidue2D[] {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);

  const fov = 95;
  const result: ProjectedResidue2D[] = new Array(KRAS_P01116_CA.length);

  for (let i = 0; i < KRAS_P01116_CA.length; i++) {
    const r = KRAS_P01116_CA[i];
    const domain = classifyKrasDomain(r.seq);

    let rx = r.x;
    let ry = r.y;
    let rz = r.z;
    if (domain === 'hvr_tail') {
      const tailIdx = r.seq - 175;
      rx += Math.sin(whipPhase * 3.2 + tailIdx * 0.45) * tailIdx * 0.65;
      ry += Math.cos(whipPhase * 2.7 + tailIdx * 0.35) * tailIdx * 0.65;
    }

    // Rotate Y (yaw)
    const x1 = rx * cy - rz * sy;
    const z1 = rx * sy + rz * cy;
    const y1 = ry;

    // Rotate X (pitch)
    const y2 = y1 * cp - z1 * sp;
    const z2 = y1 * sp + z1 * cp;
    const x2 = x1;

    // Rotate Z (roll)
    const x3 = x2 * cr - y2 * sr;
    const y3 = x2 * sr + y2 * cr;

    const persp = fov / Math.max(35, fov - z2 * 0.45);
    result[i] = {
      seq: r.seq,
      comp: r.comp,
      screenX: center.x + x3 * scale * persp,
      screenY: center.y + y3 * scale * persp,
      depthZ: z2,
      plddt: r.plddt,
      domain,
    };
  }

  return result;
}
