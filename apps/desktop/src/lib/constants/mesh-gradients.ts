// Mesh gradient backgrounds using CSS gradients
export const meshGradients = {
  mesh_aurora: 'radial-gradient(at 40% 20%, hsla(330,100%,75%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(190,100%,75%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(270,100%,75%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(39,100%,75%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(210,100%,75%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(150,100%,75%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(60,100%,75%,1) 0px, transparent 50%)',
  mesh_sunset: 'radial-gradient(at 0% 0%, hsla(355,85%,65%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(30,100%,75%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(290,85%,55%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(15,100%,60%,1) 0px, transparent 50%)',
  mesh_ocean: 'radial-gradient(at 50% 0%, hsla(200,100%,75%,1) 0px, transparent 50%), radial-gradient(at 100% 50%, hsla(190,100%,60%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(180,100%,65%,1) 0px, transparent 50%), radial-gradient(at 50% 100%, hsla(220,100%,45%,1) 0px, transparent 50%)',
  mesh_forest: 'radial-gradient(at 40% 40%, hsla(120,80%,60%,1) 0px, transparent 50%), radial-gradient(at 80% 20%, hsla(90,70%,75%,1) 0px, transparent 50%), radial-gradient(at 20% 80%, hsla(150,80%,45%,1) 0px, transparent 50%), radial-gradient(at 90% 90%, hsla(60,100%,65%,1) 0px, transparent 50%)',
  mesh_candy: 'radial-gradient(at 30% 30%, hsla(340,100%,75%,1) 0px, transparent 50%), radial-gradient(at 70% 20%, hsla(280,100%,75%,1) 0px, transparent 50%), radial-gradient(at 20% 70%, hsla(45,100%,80%,1) 0px, transparent 50%), radial-gradient(at 80% 80%, hsla(330,100%,70%,1) 0px, transparent 50%)',
  mesh_cosmic: 'radial-gradient(at 10% 10%, hsla(260,100%,40%,1) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(300,100%,50%,1) 0px, transparent 50%), radial-gradient(at 50% 50%, hsla(220,100%,30%,1) 0px, transparent 50%), radial-gradient(at 90% 90%, hsla(190,100%,60%,1) 0px, transparent 50%), radial-gradient(at 10% 90%, hsla(270,100%,60%,1) 0px, transparent 50%)',
  mesh_peach: 'radial-gradient(at 0% 0%, hsla(25,100%,85%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(340,100%,85%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(30,100%,75%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(15,100%,80%,1) 0px, transparent 50%)',
  mesh_lavender: 'radial-gradient(at 20% 20%, hsla(280,80%,80%,1) 0px, transparent 50%), radial-gradient(at 80% 20%, hsla(260,90%,85%,1) 0px, transparent 50%), radial-gradient(at 50% 80%, hsla(300,70%,75%,1) 0px, transparent 50%)',
  mesh_mint: 'radial-gradient(at 40% 20%, hsla(160,80%,75%,1) 0px, transparent 50%), radial-gradient(at 80% 60%, hsla(180,70%,80%,1) 0px, transparent 50%), radial-gradient(at 0% 80%, hsla(140,80%,70%,1) 0px, transparent 50%)',
  mesh_rose: 'radial-gradient(at 30% 30%, hsla(350,90%,80%,1) 0px, transparent 50%), radial-gradient(at 70% 70%, hsla(330,80%,75%,1) 0px, transparent 50%), radial-gradient(at 70% 30%, hsla(10,90%,85%,1) 0px, transparent 50%)',
  mesh_electric: 'radial-gradient(at 0% 50%, hsla(180,100%,50%,1) 0px, transparent 50%), radial-gradient(at 100% 50%, hsla(290,100%,60%,1) 0px, transparent 50%), radial-gradient(at 50% 0%, hsla(200,100%,70%,1) 0px, transparent 50%), radial-gradient(at 50% 100%, hsla(270,100%,50%,1) 0px, transparent 50%)',
  mesh_warm: 'radial-gradient(at 20% 30%, hsla(35,100%,70%,1) 0px, transparent 50%), radial-gradient(at 80% 30%, hsla(15,100%,65%,1) 0px, transparent 50%), radial-gradient(at 50% 80%, hsla(45,100%,75%,1) 0px, transparent 50%)',
};

export type MeshGradientKey = keyof typeof meshGradients;

// Magic gradients - extensive dark-themed gradient collection
export const magicGradients = {
  // Simple radial gradients - center glow
  magic_gold_center: 'radial-gradient(circle, rgb(172, 116, 42) 0%, transparent 50%, black 100%)',
  magic_amber_center: 'radial-gradient(circle, rgb(255, 184, 44) 0%, transparent 50%, black 100%)',
  magic_silver_center: 'radial-gradient(circle, rgb(220, 220, 223) 0%, transparent 50%, black 100%)',
  magic_cyan_center: 'radial-gradient(circle, rgb(98, 185, 220) 0%, transparent 50%, black 100%)',
  magic_olive_center: 'radial-gradient(circle, rgb(188, 189, 125) 0%, transparent 50%, black 100%)',
  magic_teal_center: 'radial-gradient(circle, rgb(0, 132, 91) 0%, transparent 50%, black 100%)',
  magic_mint_center: 'radial-gradient(circle, rgb(0, 233, 161) 0%, transparent 50%, black 100%)',

  // Ring gradients
  magic_gold_ring: 'radial-gradient(circle, transparent 0%, rgb(172, 116, 42) 50%, transparent 70%, black 100%)',
  magic_mint_ring: 'radial-gradient(circle, transparent 0%, rgb(0, 233, 161) 50%, transparent 70%, black 100%)',
  magic_orange_ring: 'radial-gradient(circle, transparent 0%, rgb(255, 77, 0) 50%, transparent 70%, black 100%)',

  // Full radials
  magic_orange_glow: 'radial-gradient(rgb(255, 77, 0) 0%, black 80%)',
  magic_cyan_glow: 'radial-gradient(rgb(98, 185, 220) 0%, black 80%)',

  // Corner positioned radials
  magic_silver_topleft: 'radial-gradient(circle at left top, rgb(220, 220, 223) 0%, black 100%)',
  magic_gold_topleft: 'radial-gradient(circle at left top, rgb(172, 116, 42) 0%, black 100%)',

  magic_cyan_topright: 'radial-gradient(circle at 70% 30%, rgb(98, 185, 220) 0%, black 100%)',
  magic_silver_topright: 'radial-gradient(circle at 70% 30%, rgb(220, 220, 223) 0%, black 100%)',
  magic_olive_topright: 'radial-gradient(circle at 70% 30%, rgb(188, 189, 125) 0%, black 100%)',
  magic_amber_topright: 'radial-gradient(circle at 70% 30%, rgb(255, 184, 44) 0%, black 100%)',
  magic_gray_topright: 'radial-gradient(circle at 70% 30%, rgb(119, 119, 136) 0%, black 100%)',

  magic_silver_bottomleft: 'radial-gradient(circle at 30% 70%, rgb(220, 220, 223) 0%, black 100%)',
  magic_gold_bottomleft: 'radial-gradient(circle at 30% 70%, rgb(172, 116, 42) 0%, black 100%)',
  magic_cyan_bottomleft: 'radial-gradient(circle at 30% 70%, rgb(98, 185, 220) 0%, black 100%)',

  magic_amber_bottom: 'radial-gradient(circle at center bottom, rgb(255, 184, 44) 0%, black 100%)',
  magic_olive_bottom: 'radial-gradient(circle at center bottom, rgb(188, 189, 125) 0%, black 100%)',

  // Off-center glows
  magic_teal_left: 'radial-gradient(circle at 30% 50%, rgb(0, 132, 91) 0%, black 75%)',
  magic_mint_left: 'radial-gradient(circle at 30% 50%, rgb(0, 233, 161) 0%, black 75%)',
  magic_amber_left: 'radial-gradient(circle at 30% 50%, rgb(255, 184, 44) 0%, black 75%)',
  magic_orange_left: 'radial-gradient(circle at 30% 50%, rgb(255, 77, 0) 0%, black 75%)',
  magic_dark_left: 'radial-gradient(circle at 30% 50%, rgb(42, 42, 46) 0%, black 75%)',

  magic_amber_below: 'radial-gradient(circle at 50% 120%, rgb(255, 184, 44) 0%, black 75%)',
  magic_dark_below: 'radial-gradient(circle at 50% 120%, rgb(42, 42, 46) 0%, black 75%)',

  // Dual diagonal spots
  magic_gold_diagonal: 'radial-gradient(circle at 25% 25%, rgb(172, 116, 42) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgb(172, 116, 42) 0%, transparent 50%), linear-gradient(135deg, rgb(7, 7, 7) 0%, rgb(12, 12, 12) 100%)',
  magic_amber_diagonal: 'radial-gradient(circle at 25% 25%, rgb(255, 184, 44) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgb(255, 184, 44) 0%, transparent 50%), linear-gradient(135deg, rgb(7, 7, 7) 0%, rgb(12, 12, 12) 100%)',
  magic_silver_diagonal: 'radial-gradient(circle at 25% 25%, rgb(220, 220, 223) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgb(220, 220, 223) 0%, transparent 50%), linear-gradient(135deg, rgb(7, 7, 7) 0%, rgb(12, 12, 12) 100%)',
  magic_cyan_diagonal: 'radial-gradient(circle at 25% 25%, rgb(98, 185, 220) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgb(98, 185, 220) 0%, transparent 50%), linear-gradient(135deg, rgb(7, 7, 7) 0%, rgb(12, 12, 12) 100%)',

  // Vertical glows
  magic_orange_vertical: 'radial-gradient(at center top, rgb(255, 77, 0) 0%, transparent 70%), radial-gradient(at center bottom, rgb(255, 77, 0) 0%, transparent 70%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_gold_vertical: 'radial-gradient(at center top, rgb(172, 116, 42) 0%, transparent 70%), radial-gradient(at center bottom, rgb(172, 116, 42) 0%, transparent 70%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_mint_vertical: 'radial-gradient(at center top, rgb(0, 233, 161) 0%, transparent 70%), radial-gradient(at center bottom, rgb(0, 233, 161) 0%, transparent 70%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_gray_vertical: 'radial-gradient(at center top, rgb(119, 119, 136) 0%, transparent 70%), radial-gradient(at center bottom, rgb(119, 119, 136) 0%, transparent 70%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_olive_vertical: 'radial-gradient(at center top, rgb(188, 189, 125) 0%, transparent 70%), radial-gradient(at center bottom, rgb(188, 189, 125) 0%, transparent 70%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_cyan_vertical: 'radial-gradient(at center top, rgb(98, 185, 220) 0%, transparent 70%), radial-gradient(at center bottom, rgb(98, 185, 220) 0%, transparent 70%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Dual color vertical
  magic_olive_gold_vertical: 'radial-gradient(at center bottom, rgb(188, 189, 125) 0%, transparent 60%), radial-gradient(at center top, rgb(172, 116, 42) 0%, transparent 60%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_amber_olive_vertical: 'radial-gradient(at center bottom, rgb(255, 184, 44) 0%, transparent 60%), radial-gradient(at center top, rgb(188, 189, 125) 0%, transparent 60%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_orange_mint_vertical: 'radial-gradient(at center bottom, rgb(255, 77, 0) 0%, transparent 60%), radial-gradient(at center top, rgb(0, 233, 161) 0%, transparent 60%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Four corner patterns
  magic_amber_dark_corners: 'radial-gradient(circle at 20% 20%, rgb(42, 42, 46) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgb(255, 184, 44) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgb(255, 184, 44) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgb(42, 42, 46) 0%, transparent 40%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Triple spot compositions
  magic_amber_teal: 'radial-gradient(circle at 30% 70%, rgb(255, 184, 44) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgb(0, 132, 91) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_gray_gold_teal: 'radial-gradient(circle at 20% 80%, rgb(119, 119, 136) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(172, 116, 42) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(0, 132, 91) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_orange_gray_olive: 'radial-gradient(circle at 20% 80%, rgb(255, 77, 0) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(119, 119, 136) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(188, 189, 125) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_orange_cyan_gold: 'radial-gradient(circle at 20% 80%, rgb(255, 77, 0) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(98, 185, 220) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(172, 116, 42) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_gray_amber: 'radial-gradient(circle at 20% 80%, rgb(42, 42, 46) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(119, 119, 136) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(255, 184, 44) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_amber_silver: 'radial-gradient(circle at 20% 80%, rgb(42, 42, 46) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(255, 184, 44) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(220, 220, 223) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_amber_mint: 'radial-gradient(circle at 20% 80%, rgb(42, 42, 46) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(255, 184, 44) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(0, 233, 161) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_orange_gray: 'radial-gradient(circle at 20% 80%, rgb(42, 42, 46) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(255, 77, 0) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(119, 119, 136) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_orange_mint: 'radial-gradient(circle at 20% 80%, rgb(42, 42, 46) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(255, 77, 0) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(0, 233, 161) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_orange_silver: 'radial-gradient(circle at 20% 80%, rgb(42, 42, 46) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgb(255, 77, 0) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(220, 220, 223) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Orb center compositions
  magic_mint_silver_orb: 'radial-gradient(circle at 25% 25%, rgb(42, 42, 46) 0%, transparent 35%), radial-gradient(circle, rgb(0, 233, 161) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgb(220, 220, 223) 0%, transparent 35%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_gray_gold_orb: 'radial-gradient(circle at 25% 25%, rgb(42, 42, 46) 0%, transparent 35%), radial-gradient(circle, rgb(119, 119, 136) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgb(172, 116, 42) 0%, transparent 35%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_olive_gold_orb: 'radial-gradient(circle at 25% 25%, rgb(42, 42, 46) 0%, transparent 35%), radial-gradient(circle, rgb(188, 189, 125) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgb(172, 116, 42) 0%, transparent 35%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_orange_teal_orb: 'radial-gradient(circle at 25% 25%, rgb(42, 42, 46) 0%, transparent 35%), radial-gradient(circle, rgb(255, 77, 0) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgb(0, 132, 91) 0%, transparent 35%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_orange_silver_orb: 'radial-gradient(circle at 25% 25%, rgb(42, 42, 46) 0%, transparent 35%), radial-gradient(circle, rgb(255, 77, 0) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgb(220, 220, 223) 0%, transparent 35%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_orange_amber_orb: 'radial-gradient(circle at 25% 25%, rgb(42, 42, 46) 0%, transparent 35%), radial-gradient(circle, rgb(255, 77, 0) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgb(255, 184, 44) 0%, transparent 35%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Multi-spot nebula patterns
  magic_gray_nebula: 'radial-gradient(circle at 20% 20%, rgba(169, 169, 186, 0.7) 0%, transparent 30%), radial-gradient(circle at 40% 60%, rgba(69, 69, 86, 0.8) 0%, transparent 40%), radial-gradient(circle at 60% 30%, rgba(169, 169, 186, 0.7) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(69, 69, 86, 0.8) 0%, transparent 25%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_gold_nebula: 'radial-gradient(circle at 20% 20%, rgba(222, 166, 92, 0.7) 0%, transparent 30%), radial-gradient(circle at 40% 60%, rgba(122, 66, 0, 0.8) 0%, transparent 40%), radial-gradient(circle at 60% 30%, rgba(222, 166, 92, 0.7) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(122, 66, 0, 0.8) 0%, transparent 25%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_olive_nebula: 'radial-gradient(circle at 20% 20%, rgba(238, 239, 175, 0.7) 0%, transparent 30%), radial-gradient(circle at 40% 60%, rgba(138, 139, 75, 0.8) 0%, transparent 40%), radial-gradient(circle at 60% 30%, rgba(238, 239, 175, 0.7) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(138, 139, 75, 0.8) 0%, transparent 25%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_mint_nebula: 'radial-gradient(circle at 20% 20%, rgba(50, 255, 211, 0.7) 0%, transparent 30%), radial-gradient(circle at 40% 60%, rgba(0, 183, 111, 0.8) 0%, transparent 40%), radial-gradient(circle at 60% 30%, rgba(50, 255, 211, 0.7) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(0, 183, 111, 0.8) 0%, transparent 25%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_amber_olive_scatter: 'radial-gradient(circle at 10% 20%, rgb(255, 184, 44) 0%, transparent 30%), radial-gradient(circle at 80% 30%, rgb(188, 189, 125) 0%, transparent 30%), radial-gradient(circle at 40% 70%, rgb(255, 184, 44) 0%, transparent 30%), radial-gradient(at 60% 80%, rgb(188, 189, 125) 0%, transparent 40%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Constellation patterns
  magic_gray_constellation: 'radial-gradient(circle at 10% 10%, rgb(119, 119, 136) 0%, transparent 15%), radial-gradient(circle at 30% 20%, rgb(119, 119, 136) 0%, transparent 10%), radial-gradient(circle, rgb(119, 119, 136) 0%, transparent 25%), radial-gradient(circle at 70% 30%, rgb(119, 119, 136) 0%, transparent 15%), radial-gradient(circle at 90% 60%, rgb(119, 119, 136) 0%, transparent 20%), radial-gradient(circle at 20% 80%, rgb(119, 119, 136) 0%, transparent 15%), radial-gradient(circle at 40% 70%, rgb(119, 119, 136) 0%, transparent 10%), radial-gradient(circle at 60% 90%, rgb(119, 119, 136) 0%, transparent 15%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_constellation: 'radial-gradient(circle at 10% 10%, rgb(42, 42, 46) 0%, transparent 15%), radial-gradient(circle at 30% 20%, rgb(42, 42, 46) 0%, transparent 10%), radial-gradient(circle, rgb(42, 42, 46) 0%, transparent 25%), radial-gradient(circle at 70% 30%, rgb(42, 42, 46) 0%, transparent 15%), radial-gradient(circle at 90% 60%, rgb(42, 42, 46) 0%, transparent 20%), radial-gradient(circle at 20% 80%, rgb(42, 42, 46) 0%, transparent 15%), radial-gradient(circle at 40% 70%, rgb(42, 42, 46) 0%, transparent 10%), radial-gradient(circle at 60% 90%, rgb(42, 42, 46) 0%, transparent 15%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_cyan_constellation: 'radial-gradient(circle at 10% 10%, rgb(98, 185, 220) 0%, transparent 15%), radial-gradient(circle at 30% 20%, rgb(98, 185, 220) 0%, transparent 10%), radial-gradient(circle, rgb(98, 185, 220) 0%, transparent 25%), radial-gradient(circle at 70% 30%, rgb(98, 185, 220) 0%, transparent 15%), radial-gradient(circle at 90% 60%, rgb(98, 185, 220) 0%, transparent 20%), radial-gradient(circle at 20% 80%, rgb(98, 185, 220) 0%, transparent 15%), radial-gradient(circle at 40% 70%, rgb(98, 185, 220) 0%, transparent 10%), radial-gradient(circle at 60% 90%, rgb(98, 185, 220) 0%, transparent 15%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Conic gradients - rotational
  magic_cyan_rotate: 'conic-gradient(rgb(98, 185, 220) 0deg, rgb(98, 185, 220) 45deg, black 45deg, black 90deg, rgb(98, 185, 220) 90deg, rgb(98, 185, 220) 135deg, black 135deg, black 180deg, rgb(98, 185, 220) 180deg, rgb(98, 185, 220) 225deg, black 225deg, black 270deg, rgb(98, 185, 220) 270deg, rgb(98, 185, 220) 315deg, black 315deg, black 360deg)',

  // Conic corner patterns
  magic_amber_corners: 'conic-gradient(at 25% 25%, rgb(255, 184, 44) 0deg, black 90deg, transparent 180deg), conic-gradient(from 90deg at 75% 25%, rgb(255, 184, 44) 0deg, black 90deg, transparent 180deg), conic-gradient(from 180deg at 75% 75%, rgb(255, 184, 44) 0deg, black 90deg, transparent 180deg), conic-gradient(from 270deg at 25% 75%, rgb(255, 184, 44) 0deg, black 90deg, transparent 180deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_olive_corners: 'conic-gradient(at 25% 25%, rgb(188, 189, 125) 0deg, black 90deg, transparent 180deg), conic-gradient(from 90deg at 75% 25%, rgb(188, 189, 125) 0deg, black 90deg, transparent 180deg), conic-gradient(from 180deg at 75% 75%, rgb(188, 189, 125) 0deg, black 90deg, transparent 180deg), conic-gradient(from 270deg at 25% 75%, rgb(188, 189, 125) 0deg, black 90deg, transparent 180deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_corners: 'conic-gradient(at 25% 25%, rgb(42, 42, 46) 0deg, black 90deg, transparent 180deg), conic-gradient(from 90deg at 75% 25%, rgb(42, 42, 46) 0deg, black 90deg, transparent 180deg), conic-gradient(from 180deg at 75% 75%, rgb(42, 42, 46) 0deg, black 90deg, transparent 180deg), conic-gradient(from 270deg at 25% 75%, rgb(42, 42, 46) 0deg, black 90deg, transparent 180deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Conic tri-color patterns
  magic_mint_gold_teal: 'conic-gradient(rgb(0, 233, 161) 0deg, transparent 60deg, rgb(172, 116, 42) 120deg, transparent 180deg, rgb(0, 132, 91) 240deg, transparent 300deg, rgb(0, 233, 161) 360deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_silver_olive_gold: 'conic-gradient(rgb(220, 220, 223) 0deg, transparent 60deg, rgb(188, 189, 125) 120deg, transparent 180deg, rgb(172, 116, 42) 240deg, transparent 300deg, rgb(220, 220, 223) 360deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_silver_teal_dark: 'conic-gradient(rgb(220, 220, 223) 0deg, transparent 60deg, rgb(0, 132, 91) 120deg, transparent 180deg, rgb(42, 42, 46) 240deg, transparent 300deg, rgb(220, 220, 223) 360deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Conic stripe patterns
  magic_orange_stripes: 'conic-gradient(rgb(255, 77, 0) 0deg, rgb(255, 77, 0) 60deg, transparent 60deg, transparent 120deg, rgb(255, 77, 0) 120deg, rgb(255, 77, 0) 180deg, transparent 180deg, transparent 240deg, rgb(255, 77, 0) 240deg, rgb(255, 77, 0) 300deg, transparent 300deg, transparent 360deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_gray_stripes: 'conic-gradient(rgb(119, 119, 136) 0deg, rgb(119, 119, 136) 60deg, transparent 60deg, transparent 120deg, rgb(119, 119, 136) 120deg, rgb(119, 119, 136) 180deg, transparent 180deg, transparent 240deg, rgb(119, 119, 136) 240deg, rgb(119, 119, 136) 300deg, transparent 300deg, transparent 360deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_silver_stripes: 'conic-gradient(rgb(220, 220, 223) 0deg, rgb(220, 220, 223) 60deg, transparent 60deg, transparent 120deg, rgb(220, 220, 223) 120deg, rgb(220, 220, 223) 180deg, transparent 180deg, transparent 240deg, rgb(220, 220, 223) 240deg, rgb(220, 220, 223) 300deg, transparent 300deg, transparent 360deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_stripes: 'conic-gradient(rgb(42, 42, 46) 0deg, rgb(42, 42, 46) 60deg, transparent 60deg, transparent 120deg, rgb(42, 42, 46) 120deg, rgb(42, 42, 46) 180deg, transparent 180deg, transparent 240deg, rgb(42, 42, 46) 240deg, rgb(42, 42, 46) 300deg, transparent 300deg, transparent 360deg), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Linear X pattern
  magic_amber_mint_x: 'linear-gradient(45deg, transparent 40%, rgb(255, 184, 44) 40%, rgb(255, 184, 44) 60%, transparent 60%), linear-gradient(135deg, transparent 40%, rgb(0, 233, 161) 40%, rgb(0, 233, 161) 60%, transparent 60%), radial-gradient(circle, rgb(220, 220, 223) 0%, transparent 50%), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Grid patterns
  magic_mint_grid: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgb(0, 233, 161) 10px, rgb(0, 233, 161) 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgb(0, 233, 161) 10px, rgb(0, 233, 161) 11px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_gold_grid: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgb(172, 116, 42) 10px, rgb(172, 116, 42) 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgb(172, 116, 42) 10px, rgb(172, 116, 42) 11px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_silver_grid: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgb(220, 220, 223) 10px, rgb(220, 220, 223) 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgb(220, 220, 223) 10px, rgb(220, 220, 223) 11px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Diagonal stripe patterns
  magic_teal_diagonal: 'repeating-linear-gradient(45deg, black, black 5px, rgb(0, 132, 91) 5px, rgb(0, 132, 91) 10px, black 10px, black 15px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_diagonal: 'repeating-linear-gradient(45deg, black, black 5px, rgb(42, 42, 46) 5px, rgb(42, 42, 46) 10px, black 10px, black 15px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Cross-hatch patterns
  magic_silver_crosshatch: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(220, 220, 223, 0.2) 5px, rgba(220, 220, 223, 0.2) 10px), repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(220, 220, 223, 0.2) 5px, rgba(220, 220, 223, 0.2) 10px), linear-gradient(rgb(15, 15, 15) 0%, rgb(15, 15, 15) 100%)',
  magic_amber_crosshatch: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255, 184, 44, 0.2) 5px, rgba(255, 184, 44, 0.2) 10px), repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(255, 184, 44, 0.2) 5px, rgba(255, 184, 44, 0.2) 10px), linear-gradient(rgb(15, 15, 15) 0%, rgb(15, 15, 15) 100%)',
  magic_gray_crosshatch: 'repeating-linear-gradient(45deg, rgba(119, 119, 136, 0.05), rgba(119, 119, 136, 0.05) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(135deg, rgba(119, 119, 136, 0.05), rgba(119, 119, 136, 0.05) 1px, transparent 1px, transparent 5px), linear-gradient(rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',

  // Noise-like patterns
  magic_mint_noise: 'repeating-conic-gradient(rgba(0, 233, 161, 0.05) 0deg, transparent 1deg, rgba(0, 233, 161, 0.05) 2deg), linear-gradient(rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',
  magic_olive_noise: 'repeating-conic-gradient(rgba(188, 189, 125, 0.05) 0deg, transparent 1deg, rgba(188, 189, 125, 0.05) 2deg), linear-gradient(rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',
  magic_orange_noise: 'repeating-conic-gradient(rgba(255, 77, 0, 0.05) 0deg, transparent 1deg, rgba(255, 77, 0, 0.05) 2deg), linear-gradient(rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',

  // Dot matrix patterns
  magic_cyan_dots: 'repeating-radial-gradient(circle at 25% 25%, transparent 0px, rgb(98, 185, 220) 1px, transparent 2px), repeating-radial-gradient(circle at 75% 75%, transparent 0px, rgb(98, 185, 220) 1px, transparent 2px), repeating-radial-gradient(circle, transparent 0px, rgb(98, 185, 220) 1px, transparent 2px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_gold_dots: 'repeating-radial-gradient(circle at 25% 25%, transparent 0px, rgb(172, 116, 42) 1px, transparent 2px), repeating-radial-gradient(circle at 75% 75%, transparent 0px, rgb(172, 116, 42) 1px, transparent 2px), repeating-radial-gradient(circle, transparent 0px, rgb(172, 116, 42) 1px, transparent 2px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_teal_dots: 'repeating-radial-gradient(circle at 25% 25%, transparent 0px, rgb(0, 132, 91) 1px, transparent 2px), repeating-radial-gradient(circle at 75% 75%, transparent 0px, rgb(0, 132, 91) 1px, transparent 2px), repeating-radial-gradient(circle, transparent 0px, rgb(0, 132, 91) 1px, transparent 2px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',
  magic_dark_dots: 'repeating-radial-gradient(circle at 25% 25%, transparent 0px, rgb(42, 42, 46) 1px, transparent 2px), repeating-radial-gradient(circle at 75% 75%, transparent 0px, rgb(42, 42, 46) 1px, transparent 2px), repeating-radial-gradient(circle, transparent 0px, rgb(42, 42, 46) 1px, transparent 2px), linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%)',

  // Soft mint dots
  magic_mint_soft_dots: 'repeating-radial-gradient(circle at 25% 25%, transparent 0px, rgba(0, 233, 161, 0.1) 1px, transparent 2px), repeating-radial-gradient(circle at 75% 75%, transparent 0px, rgba(0, 233, 161, 0.1) 1px, transparent 3px), linear-gradient(rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',

  // Starfield patterns
  magic_cyan_starfield: 'repeating-radial-gradient(circle at 10% 10%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 20% 20%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 30% 30%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 40% 40%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 60% 60%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 70% 70%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 80% 80%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 90% 90%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 15% 45%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 35% 65%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 55% 85%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 75% 25%, transparent 0px, rgba(98, 185, 220, 0.15) 1px, transparent 1px), linear-gradient(rgb(12, 12, 12) 0%, rgb(15, 15, 15) 100%)',
  magic_gold_starfield: 'repeating-radial-gradient(circle at 10% 10%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 20% 20%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 30% 30%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 40% 40%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 60% 60%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 70% 70%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 80% 80%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 90% 90%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 15% 45%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 35% 65%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 55% 85%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 75% 25%, transparent 0px, rgba(172, 116, 42, 0.15) 1px, transparent 1px), linear-gradient(rgb(12, 12, 12) 0%, rgb(15, 15, 15) 100%)',
  magic_silver_starfield: 'repeating-radial-gradient(circle at 10% 10%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 20% 20%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 30% 30%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 40% 40%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 60% 60%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 70% 70%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 80% 80%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 90% 90%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 15% 45%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 35% 65%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 55% 85%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), repeating-radial-gradient(circle at 75% 25%, transparent 0px, rgba(220, 220, 223, 0.15) 1px, transparent 1px), linear-gradient(rgb(12, 12, 12) 0%, rgb(15, 15, 15) 100%)',
};

export type MagicGradientKey = keyof typeof magicGradients;
