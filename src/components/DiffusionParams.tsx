import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { RefreshCw, ImageOff } from "lucide-react";
import type { StreamDiffusionParams } from "@/lib/daydream";

const FRONT_PROMPTS = [
  "studio ghibli portrait, soft rim light",
  "cyberpunk neon portrait 90s anime",
  "watercolor ink portrait, loose brush",
  "melting holographic portrait, liquid chrome",
  "psychedelic kaleidoscope face, fractal patterns",
  "glitch art portrait, RGB split, datamosh",
  "cosmic deity portrait, galaxy skin, star eyes",
  "retro VHS portrait, scan lines, 80s aesthetic",
  "paper cutout collage portrait, layered colors",
  "oil painting portrait, impasto texture",
  "neon wireframe portrait, tron aesthetic",
  "crystalline ice portrait, frozen fractals",
  "graffiti street art portrait, spray paint drips, urban",
  "cel-shaded anime portrait, bold outlines, flat colors",
  "ethereal ghost portrait, translucent, wispy trails",
];

const BACK_PROMPTS = [
  "impressionist garden, monet style, soft focus",
  "cyberpunk cityscape, neon signs, rain reflections",
  "fantasy forest, bioluminescent plants, mystical",
  "abstract expressionism, bold brushstrokes, vibrant",
  "steampunk mechanism, brass gears, Victorian",
  "surreal dreamscape, melting clocks, dali inspired",
  "pixel art landscape, 8-bit retro, nostalgic",
  "stained glass cathedral, colorful light rays",
  "abstract fluid art, marbled ink, organic flow",
  "cosmic nebula, swirling stars, deep space",
  "minimalist geometric shapes, clean lines, modern",
  "gothic architecture, dark stone, dramatic shadows",
  "tropical paradise, palm trees, sunset colors",
  "enchanted library, floating books, magical atmosphere",
  "cherry blossom garden, pink petals falling, serene",
  "gothic cathedral interior, stained glass, divine rays",
];

const TEXTURES = [
  {
    id: "lava",
    url: "https://t4.ftcdn.net/jpg/01/83/14/47/360_F_183144766_dbGaN37u6a4VCliXQ6wcarerpYmuLAto.jpg",
    name: "Lava",
  },
  {
    id: "galaxy_orion",
    url: "https://science.nasa.gov/wp-content/uploads/2023/04/orion-nebula-xlarge_web-jpg.webp",
    name: "Galaxy",
  },
  {
    id: "dragon_scales",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/roof_tiles/roof_tiles_diff_1k.jpg",
    name: "Dragon Scales (Roof Tiles, PH 1K)",
  },
  {
    id: "water_ripples",
    url: "https://media.gettyimages.com/id/585332126/photo/rock-face.jpg?s=612x612&w=gi&k=20&c=bX6I0qs7hVDXs0ZUaqPUb1uLkLaZm-ASZxVd5TDXW-A=",
    name: "Water Ripples (TextureLabs)",
  },
  {
    id: "lightning",
    url: "https://opengameart.org/sites/default/files/l1.png",
    name: "Lightning Bolt (OGA PNG)",
  },
  {
    id: "sand_dunes",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/aerial_sand/aerial_sand_diff_1k.jpg",
    name: "Sand Dunes (PH 1K)",
  },
  {
    id: "sand_dunes_2",
    url: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/aerial_beach_01/aerial_beach_01_diff_1k.jpg",
    name: "Beach Ripples (PH 1K)",
  },
  {
    id: "foam_ocean",
    url: "https://t3.ftcdn.net/jpg/02/03/50/32/360_F_203503200_3M3ZmpW9nhU6faaF3fewlkIMtRWxlHye.jpg",
    name: "Ocean Foam (ambientCG 1K)",
  },
];

export interface BrewParams {
  prompt: string;
  texture: string | null;
  textureWeight: number;
  intensity: number;
  quality: number;
}

interface DiffusionParamsProps {
  cameraType: "user" | "environment" | null;
  brewParams: BrewParams;
  onBrewParamsChange: (brewParams: BrewParams) => void;
  handleStreamDiffusionParams: (streamParams: StreamDiffusionParams) => void;
  onError?: (error: Error) => void;
}

const calculateTIndexList = (intensity: number, quality: number): number[] => {
  let t_index_list: number[];

  let qualityExtra: number;
  if (quality < 0.25) {
    t_index_list = [6];
    qualityExtra = quality * 24;
  } else if (quality < 0.5) {
    t_index_list = [6, 12];
    qualityExtra = (quality - 0.25) * 24;
  } else if (quality < 0.75) {
    t_index_list = [6, 12, 18];
    qualityExtra = (quality - 0.5) * 24;
  } else {
    t_index_list = [6, 12, 18, 24];
    qualityExtra = (quality - 0.75) * 24;
  }
  t_index_list = t_index_list.map((v) => v + qualityExtra);

  // intensity scales the values, higher intensity -> lower values
  const intensityScale = 2.32 - 0.132 * intensity;
  t_index_list = t_index_list.map((v) => v * intensityScale);

  // clamp and round the values
  return t_index_list.map((v) => Math.max(0, Math.min(49, Math.round(v))));
};

export function DiffusionParams({
  cameraType,
  brewParams,
  onBrewParamsChange,
  handleStreamDiffusionParams,
  onError,
}: DiffusionParamsProps) {
  const [texturePopoverOpen, setTexturePopoverOpen] = useState(false);

  // brewParams state is controlled by the parent component
  const prompt = brewParams.prompt;
  const textureId = brewParams.texture;
  const textureWeight = useMemo(() => [brewParams.textureWeight], [brewParams.textureWeight]);
  const intensity = useMemo(() => [brewParams.intensity], [brewParams.intensity]);
  const quality = useMemo(() => [brewParams.quality], [brewParams.quality]);

  const updateBrewParams = useCallback((updates: Partial<BrewParams>) => {
    const newBrewParams = { ...brewParams, ...updates };
    onBrewParamsChange(newBrewParams);
  }, [brewParams, onBrewParamsChange]);

  useEffect(() => {
    // Compute new stream params
    let sdParams: StreamDiffusionParams = {
      model_id: "stabilityai/sdxl-turbo",
      prompt: prompt?.trim() || "barista",
      negative_prompt: "blurry, low quality, flat, 2d, distorted",
      t_index_list: calculateTIndexList(intensity[0], quality[0]),
      seed: 42,
      num_inference_steps: 50,
      controlnets: [
        {
          enabled: true,
          model_id: "xinsir/controlnet-depth-sdxl-1.0",
          preprocessor: "depth_tensorrt",
          preprocessor_params: {},
          conditioning_scale: 0.6,
        },
        {
          enabled: true,
          model_id: "xinsir/controlnet-canny-sdxl-1.0",
          preprocessor: "canny",
          preprocessor_params: {},
          conditioning_scale: 0.3,
        },
        {
          enabled: true,
          model_id: "xinsir/controlnet-tile-sdxl-1.0",
          preprocessor: "feedback",
          preprocessor_params: {},
          conditioning_scale: 0.2,
        },
      ],
      ip_adapter: {
        enabled: false,
        type: "regular",
        scale: 0,
        weight_type: "linear",
        insightface_model_name: "buffalo_l",
      },
    };

    if (textureId) {
      const textureUrl = TEXTURES.find((t) => t.id === textureId)?.url;
      if (!textureUrl) {
        onError?.(new Error("Invalid texture ID"));
        return;
      }
      sdParams = {
        ...sdParams,
        ip_adapter: {
          enabled: true,
          type: "regular",
          scale: textureWeight[0],
          weight_type: "linear",
          insightface_model_name: "buffalo_l",
        },
        ip_adapter_style_image_url: textureUrl,
      };
    }
    handleStreamDiffusionParams(sdParams);
  }, [handleStreamDiffusionParams, prompt, intensity, quality, textureId, textureWeight, onError]);

  useEffect(() => {
    updateBrewParams({ prompt: prompt });
  }, [prompt, updateBrewParams]);

  const shufflePrompt = useCallback(() => {
    const prompts = !cameraType
      ? ["barista"]
      : cameraType === "user"
      ? FRONT_PROMPTS
      : BACK_PROMPTS;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    updateBrewParams({ prompt: randomPrompt });
  }, [cameraType, updateBrewParams]);

  // Event handlers for form inputs
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBrewParams({ prompt: e.target.value });
  }, [updateBrewParams]);

  const handleRemoveTexture = useCallback(() => {
    updateBrewParams({ texture: null });
    setTexturePopoverOpen(false);
  }, [updateBrewParams]);

  const handleSelectTexture = useCallback((textureId: string) => {
    updateBrewParams({ texture: textureId });
    setTexturePopoverOpen(false);
  }, [updateBrewParams]);

  const handleTextureWeightChange = useCallback((val: number[]) => {
    updateBrewParams({ textureWeight: val[0] });
  }, [updateBrewParams]);

  const handleIntensityChange = useCallback((val: number[]) => {
    updateBrewParams({ intensity: val[0] });
  }, [updateBrewParams]);

  const handleQualityChange = useCallback((val: number[]) => {
    updateBrewParams({ quality: val[0] });
  }, [updateBrewParams]);

  return (
    <div className="bg-neutral-950 rounded-3xl p-5 border border-neutral-800 space-y-4 shadow-inner">
      <div>
        <label className="text-sm font-medium mb-2 block text-neutral-300">
          Prompt
        </label>
        <div className="flex items-start gap-2">
          <Textarea
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe your AI effect..."
            className="bg-neutral-950 border-neutral-800 focus:border-neutral-600 focus:ring-0 text-neutral-100 placeholder:text-neutral-500 min-h-[60px] resize-none"
            rows={2}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={shufflePrompt}
            className="bg-neutral-950 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-850 shrink-0"
            title="Random prompt"
          >
            <RefreshCw className="h-4 w-4 text-neutral-300" />
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-neutral-300">
          Texture
        </label>

        <div className="flex items-center gap-4">
          <Popover
            open={texturePopoverOpen}
            onOpenChange={setTexturePopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-neutral-950 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-850 !w-16 !h-16 rounded-full overflow-hidden px-0 py-0 w-full sm:w-auto"
              >
                {textureId ? (
                  <>
                    <img
                      src={
                        TEXTURES.find((t) => t.id === textureId)?.url
                      }
                      alt="Selected texture"
                      className="w-8 h-8 object-cover rounded"
                    />
                  </>
                ) : (
                  <ImageOff className="w-5 h-5 text-neutral-400" />
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              sideOffset={8}
              className="w-[90vw] sm:w-80 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl p-4"
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      <Button
                        onClick={handleRemoveTexture}
                  variant="outline"
                  className="aspect-square p-0 overflow-hidden bg-neutral-950 border-neutral-800 hover:border-neutral-600"
                >
                  <ImageOff className="w-5 h-5 text-neutral-400" />
                </Button>
                {TEXTURES.map((texture) => (
                  <Button
                    key={texture.id}
                    onClick={() => handleSelectTexture(texture.id)}
                    variant="outline"
                    className="aspect-square p-0 overflow-hidden bg-neutral-950 border-neutral-800 hover:border-neutral-600"
                  >
                    <img
                      src={texture.url}
                      alt={texture.name}
                      className="w-full h-full object-cover"
                    />
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {textureId && (
            <div className="flex-1">
              <div className="text-xs text-neutral-400 mb-1.5">
                {TEXTURES.find((t) => t.id === textureId)?.name}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500 whitespace-nowrap">
                  Weight:
                </label>
                <Slider
                  value={textureWeight}
                  onValueChange={handleTextureWeightChange}
                  min={0}
                  max={1}
                  step={0.01}
                  className="flex-1 accent-neutral-400"
                />
                <span className="text-xs text-neutral-400 w-10 text-right">
                  {textureWeight[0].toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-neutral-300">
          Intensity: {intensity[0].toFixed(2)}
        </label>
        <Slider
          value={intensity}
          onValueChange={handleIntensityChange}
          min={0}
          max={10}
          step={0.1}
          className="w-full accent-neutral-400 h-6"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-neutral-300">
          Quality: {quality[0].toFixed(2)}
        </label>
        <Slider
          value={quality}
          onValueChange={handleQualityChange}
          min={0}
          max={1}
          step={0.01}
          className="w-full accent-neutral-400 h-6"
        />
      </div>
    </div>
  );
}

