/* The Carousel has up to five visible slots depending on the number of actual
   items passed to it. The slots will always appear in the same place if they
   appear, so naming them will help improve readability besides giving us
   type safety and other benefits. */
export const CarouselSlot = {
  Center: 0,
  Left: -1,
  Right: 1,
  LeftSilhouette: -2,
  RightSilhouette: 2,
} as const;

/* Create a CarouselSlot type that ensures only valid slot values are allowed.

   typeof CarouselSlot --> 
   {
        readonly Center: 0;
        readonly Left: -1;
        readonly Right: 1;
        ...
    }

   keyof typeof CarouselSlot --> union of the keys from the CarouselSlot object 
   above. So, "Center" | "Left" | "Right" | ...
   
   typeof CarouselSlot[keyof typeof CarouselSlot] --> gets the union of the values 
   of the CarouselSlotObject. So, 0 | -1 | 1 | ... 
*/
export type CarouselSlot = typeof CarouselSlot[keyof typeof CarouselSlot];

export const ALL_SLOTS: CarouselSlot[] = [
  CarouselSlot.LeftSilhouette,
  CarouselSlot.Left,
  CarouselSlot.Center,
  CarouselSlot.Right,
  CarouselSlot.RightSilhouette,
] as const;

export interface SlotTransform {
    x: number;
    scale: number;
    rotateY: number;
    zIndex: number;
}
