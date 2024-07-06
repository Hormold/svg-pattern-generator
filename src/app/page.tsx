"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import themes from './themes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


import {
  patternTypes,
  sizeGradientTypes,
  getRandomColor,
  updateCanvasSize,
  resetPageBackground,
  setPageBackground,
} from './helpers';


const PatternGenerator = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef<number | null>(null);
  const [settings, setSettings] = useState({
    minShapeSize: 2,
    maxShapeSize: 5,
    spacing: 20,
    randomizePosition: false,
    randomizeColor: false,
    theme: 'default',
    patternType: 'dots',
    rotation: 0,
    offsetIncrementRotation: false,
    aspectRatio: '1:1',
    sizeGradient: 0,
    dynamicShapeSize: false,
    sizeGradientType: 'none',
    sizeGradientIntensity: 100,
    setAsPageBackground: false,
    // Animation settings
    animationEnabled: false,
    animationPattern: 'linear',
    animationSpeed: 0.005,
    animationDirection: 0,

    offsetRotationFactor: 1,
    offsetRotationBase: 360,
    centerGradientRandomness: 0.2,
    opacityRandomization: 0,

    // Spiral settings
    gradientStartX: 0.5,
    gradientStartY: 0.5,
    gradientAngle: 0,
    gradientRadius: 1,
    spiralTightness: 10,
    spiralDirection: 'clockwise',
    waveFrequency: 5,
    waveRotation: 0,
    checkerboardSize: 50,
    angularOffset: 0,
    invertCenterGradient: false,
  
  });
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const [animationState, setAnimationState] = useState({
    time: 0,
    randomX: Math.random(),
    randomY: Math.random(),
    spiralRotation: 0,
    spiralSpeed: 0.01,
    spiralFactor: 10,
  });

  const frame = () => {
    generatePattern(ctx!);
    if(settings.animationEnabled)
      updateAnimationState();
  };
  

  useEffect(() => {
    if(!ctx) {
      const canvasNew = canvasRef.current! as HTMLCanvasElement;
      const ctxNew = canvasNew.getContext('2d');
      setCtx(ctxNew);
      setCanvas(canvasNew);
      updateCanvasSize(canvasNew);
      window.addEventListener('resize', () => updateCanvasSize(canvasNew));
    }

    frame();
    
    if (settings.setAsPageBackground) {
      setPageBackground(canvas!.toDataURL());
    } else {
      resetPageBackground();
    }

    localStorage.setItem('pattern-generator-settings', JSON.stringify(settings));
  }, [settings]);

  requestAnimationFrame(() => {
    if(settings.animationEnabled) {
      frame();
    }
  });


  useEffect(() => {
    const savedSettings = localStorage.getItem('pattern-generator-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({ ...prevSettings, ...parsedSettings }));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const updateAnimationState = () => {
    setAnimationState((prevState) => {
      const pattern = settings.animationPattern;
      const speed = settings.animationSpeed;
      const direction = settings.animationDirection;
      const radianDirection = direction * Math.PI / 180;
      let newTime = (prevState.time + speed) % 1;
      let newX = prevState.randomX;
      let newY = prevState.randomY;

      switch (pattern) {
        case 'linear':
          newX = (prevState.randomX + speed * Math.cos(radianDirection)) % 1;
          newY = (prevState.randomY + speed * Math.sin(radianDirection)) % 1;
          break;
        case 'circular':
          newX = 0.5 + 0.5 * Math.cos(newTime * 2 * Math.PI);
          newY = 0.5 + 0.5 * Math.sin(newTime * 2 * Math.PI);
          break;
        case 'bounce':
          newX = Math.abs(Math.sin(newTime * Math.PI));
          newY = Math.abs(Math.cos(newTime * Math.PI));
          break;
        case 'random':
          if (Math.random() < speed * 10) {
            newX = Math.random();
            newY = Math.random();
          }
          break;
      }
      
      return {
        time: newTime,
        randomX: newX,
        randomY: newY, 
        spiralRotation: (prevState.spiralRotation + prevState.spiralSpeed) % (2 * Math.PI),
        spiralSpeed: prevState.spiralSpeed,
        spiralFactor: prevState.spiralFactor
        };
    });

  };
  const getSizeGradient = (x: number, y: number, width: number, height: number) => {
    const { waveFrequency,
    waveRotation,
    checkerboardSize,
    angularOffset,
    invertCenterGradient,
    sizeGradientType, sizeGradientIntensity, centerGradientRandomness, gradientRadius, gradientAngle, spiralDirection, spiralTightness } = settings;
    const intensity = sizeGradientIntensity / 100;
    let gradientValue;

    const startX = 0;//animationState.randomX * width;
    const startY = 0;//animationState.randomY * height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(width ** 2 + height ** 2);
    const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const angleRad = gradientAngle * Math.PI / 180;
    const dx = x - startX;
    const dy = y - startY;

    switch (sizeGradientType) {
      case 'linear':
        const dx = x - startX;
        const dy = y - startY;
        gradientValue = (dx * Math.cos(angleRad) + dy * Math.sin(angleRad)) / Math.max(width, height);
        break;
      case 'radial':
        const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
        gradientValue = Math.min(distance / (gradientRadius * Math.max(width, height) / 2), 1);
        break;
      case 'diagonalWaves':
        const frequency = waveFrequency;
        const rotationRad = waveRotation * Math.PI / 180;
        const rotatedX = (x - startX) * Math.cos(rotationRad) - (y - startY) * Math.sin(rotationRad);
        const rotatedY = (x - startX) * Math.sin(rotationRad) + (y - startY) * Math.cos(rotationRad);
        const diagonal = (rotatedX / width + rotatedY / height) / 2;
        const animationOffset = animationState.time;
        //gradientValue = (Math.sin(diagonal * Math.PI * 2 * frequency) + 1) / 2;
        gradientValue = (Math.sin((diagonal + animationOffset) * Math.PI * 2 * frequency) + 1) / 2;
      
        break;

      case 'angular':
        let angle1 = Math.atan2(y - startY, x - startX);
        if(settings.animationEnabled) {
          angle1 += animationState.time * 2 * Math.PI;
        }
        const offsetRad = angularOffset * Math.PI / 180;
        gradientValue = ((angle1 + offsetRad) % (2 * Math.PI)) / (2 * Math.PI);
        
        break;
      case 'checkerboard':
        const cellSize = checkerboardSize;
        const cellX = Math.floor((x - 0) / cellSize);
        const cellY = Math.floor((y - 0) / cellSize);
        gradientValue = (cellX + cellY) % 2 === 0 ? 0 : Math.min(distanceFromCenter / maxDistance, 1);
        // Add animation
        if(settings.animationEnabled) {
          gradientValue = (gradientValue + Math.max(Math.sin(animationState.time * 2 * Math.PI), 0)) % 1;
        }
        break;

      case 'spiral':
        const angleFromCenter = Math.atan2(y - centerY, x - centerX);
        const spiralRotation = animationState.spiralRotation;
        let spiralFactor = spiralTightness;

        if(spiralDirection === 'counterclockwise') {
          spiralFactor *= -1;
        }

        gradientValue = ((distanceFromCenter / (Math.min(width, height) / 2) + 
                         (angleFromCenter + spiralRotation) / (2 * Math.PI) * spiralFactor) % 1);
        break;
      case 'diamond':
        const dx2 = Math.abs(x - (width / 2)) / width;
        const dy2 = Math.abs(y - (height / 2)) / height;
        gradientValue = Math.max(dx2, dy2);
        gradientValue= (gradientValue + 1) % 1;

        break;
      case 'centerGradient':
        const maxDistance = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
        const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
        const randomFactor = 1 + (Math.random() - 0.5) * 2 * centerGradientRandomness;
        gradientValue = normalizedDistance * randomFactor;
        if (invertCenterGradient) {
          gradientValue = 1 - gradientValue;
        }
        break;
      default:
        return 1;
    }

    gradientValue = (gradientValue + 1) % 1; // Ensure value is between 0 and 1
    return 1 - intensity + intensity * gradientValue;
  };

  const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, type: string, rotation: number, opacity: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = size / 4;
    ctx.globalAlpha = opacity;

    switch (type) {
      case 'dots':
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'lines':
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.stroke();
        break;
      case 'crosses':
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(0, size / 2);
        ctx.stroke();
        break;
      case 'circles':
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'triangles':
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'squares':
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
    }
    ctx.restore();
  };

  const generatePattern = (ctx: CanvasRenderingContext2D) => {
    if(!ctx || !ctx.canvas) return;
    const { width, height } = ctx.canvas;
    const rows = Math.ceil(height / settings.spacing) + 1;
    const cols = Math.ceil(width / settings.spacing) + 1;
    const currentTheme = themes[settings.theme!];

    ctx.fillStyle = currentTheme.background;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let x = j * settings.spacing;
        let y = i * settings.spacing;

        if (settings.randomizePosition) {
          x += Math.random() * settings.spacing / 2 - settings.spacing / 4;
          y += Math.random() * settings.spacing / 2 - settings.spacing / 4;
        }

        const color = settings.randomizeColor ? getRandomColor(currentTheme.shapeColor) : currentTheme.shapeColor;
        
        const gradientFactor = getSizeGradient(x, y, width, height);
        let size = settings.minShapeSize + (settings.maxShapeSize - settings.minShapeSize) * gradientFactor;

        /*const rotation = settings.offsetIncrementRotation 
          ? settings.rotation + (i + j) * (360 / (rows + cols))
          : settings.rotation;*/
        const rotation = settings.offsetIncrementRotation 
          ? settings.rotation + (i + j) * (settings.offsetRotationBase / (rows + cols)) * settings.offsetRotationFactor
          : settings.rotation;

        const opacity = 1 - Math.random() * settings.opacityRandomization;

        drawShape(ctx, x, y, size, color, settings.patternType, rotation, opacity);
      }
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    console.log(`Setting ${key} changed to ${value}`,{value})
    // Inverse if it's a boolean
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderSettingControl = (key: string, label: string, control: React.ReactNode) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label} ({settings[key]!})</label>
      {control}
    </div>
  );


  return (
    <div className="flex h-screen" style={{backgroundColor: themes[settings.theme].background}}>
      <div className="w-3/4 h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-300"
        />
      </div>
      <ScrollArea className={`w-1/4 bg-gray-100 p-4`} style={{backgroundColor: themes[settings.theme].background}}>
        <div className="space-y-6">
        <Accordion type="multiple" defaultValue={["basic", "shape", "gradient", "rotation", "randomization", "animation", "spiral", "layout"]} className="w-full space-y-4">
  <AccordionItem value="basic">
    <AccordionTrigger>Basic Settings</AccordionTrigger>
    <AccordionContent className="space-y-4">
      {renderSettingControl('patternType', 'Pattern Type',
        <Select value={settings.patternType} onValueChange={(value) => handleSettingChange('patternType', value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select pattern type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(patternTypes).map(([key, name]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {renderSettingControl('theme', 'Theme',
        <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(themes).map(([key, theme]) => (
              <SelectItem key={key} value={key} className="flex items-center" style={{ color: theme.shapeColor, backgroundColor: theme.background }}>
                <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: theme.shapeColor }}></span>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {renderSettingControl('spacing', 'Spacing',
        <Slider
          value={[settings.spacing]}
          onValueChange={([value]) => handleSettingChange('spacing', value)}
          min={5}
          max={50}
          step={1}
        />
      )}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="shape">
    <AccordionTrigger>Shape Settings</AccordionTrigger>
    <AccordionContent className="space-y-4">
      {renderSettingControl('dynamicShapeSize', 'Dynamic Shape Size',
        <Switch
          checked={settings.dynamicShapeSize}
          onCheckedChange={(checked) => handleSettingChange('dynamicShapeSize', checked)}
        />
      )}
      {!settings.dynamicShapeSize && (
        <>
          {renderSettingControl('minShapeSize', 'Min Shape Size',
            <Slider
              value={[settings.minShapeSize]}
              onValueChange={([value]) => handleSettingChange('minShapeSize', value)}
              min={1}
              max={10}
              step={0.5}
            />
          )}
          {renderSettingControl('maxShapeSize', 'Max Shape Size',
            <Slider
              value={[settings.maxShapeSize]}
              onValueChange={([value]) => handleSettingChange('maxShapeSize', value)}
              min={1}
              max={20}
              step={0.5}
            />
          )}
        </>
      )}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="gradient">
  <AccordionTrigger>Gradient Settings</AccordionTrigger>
  <AccordionContent className="space-y-4">
    {renderSettingControl('sizeGradientType', 'Size Gradient Type',
      <Select
        value={settings.sizeGradientType}
        onValueChange={(value) => handleSettingChange('sizeGradientType', value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select size gradient" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(sizeGradientTypes).map(([key, name]) => (
            <SelectItem key={key} value={key}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
    {settings.sizeGradientType !== 'none' && (
      <>
        {renderSettingControl('sizeGradientIntensity', 'Size Gradient Intensity',
          <Slider
            value={[settings.sizeGradientIntensity]}
            onValueChange={([value]) => handleSettingChange('sizeGradientIntensity', value)}
            min={0}
            max={100}
            step={1}
          />
        )}
        {settings.sizeGradientType === 'diagonalWaves' && (
          <>
            {renderSettingControl('waveFrequency', 'Wave Frequency',
              <Slider
                value={[settings.waveFrequency]}
                onValueChange={([value]) => handleSettingChange('waveFrequency', value)}
                min={1}
                max={20}
                step={0.1}
              />
            )}
            {renderSettingControl('waveRotation', 'Wave Rotation',
              <Slider
                value={[settings.waveRotation]}
                onValueChange={([value]) => handleSettingChange('waveRotation', value)}
                min={0}
                max={360}
                step={1}
              />
            )}
          </>
        )}
         {settings.sizeGradientType === 'angular' && (
          renderSettingControl('angularOffset', 'Angular Offset',
            <Slider
              value={[settings.angularOffset]}
              onValueChange={([value]) => handleSettingChange('angularOffset', value)}
              min={0}
              max={360}
              step={1}
            />
          )
        )}
        {settings.sizeGradientType === 'checkerboard' && (
          renderSettingControl('checkerboardSize', 'Checkerboard Size',
            <Slider
              value={[settings.checkerboardSize]}
              onValueChange={([value]) => handleSettingChange('checkerboardSize', value)}
              min={10}
              max={200}
              step={1}
            />
          )
        )}
        {['linear', 'radial'].includes(settings.sizeGradientType) && (
          renderSettingControl('gradientAngle', 'Gradient Angle',
            <Slider
              value={[settings.gradientAngle]}
              onValueChange={([value]) => handleSettingChange('gradientAngle', value)}
              min={0}
              max={360}
              step={1}
            />
          )
        )}
        {settings.sizeGradientType === 'radial' && (
          renderSettingControl('gradientRadius', 'Gradient Radius',
            <Slider
              value={[settings.gradientRadius]}
              onValueChange={([value]) => handleSettingChange('gradientRadius', value)}
              min={0}
              max={2}
              step={0.01}
            />
          )
        )}
        {settings.sizeGradientType === 'centerGradient' && (
          <>
            {renderSettingControl('centerGradientRandomness', 'Center Gradient Randomness',
              <Slider
                value={[settings.centerGradientRandomness]}
                onValueChange={([value]) => handleSettingChange('centerGradientRandomness', value)}
                min={0}
                max={1}
                step={0.01}
              />
            )}
            {renderSettingControl('invertCenterGradient', 'Invert Center Gradient',
              <Switch
                checked={settings.invertCenterGradient}
                onCheckedChange={(checked) => handleSettingChange('invertCenterGradient', checked)}
              />
            )}
          </>
        )}
        {settings.sizeGradientType === 'spiral' && (
          <>
            {renderSettingControl('spiralTightness', 'Spiral Tightness',
              <Slider
                value={[settings.spiralTightness]}
                onValueChange={([value]) => handleSettingChange('spiralTightness', value)}
                min={1}
                max={20}
                step={0.1}
              />
            )}
            {renderSettingControl('spiralDirection', 'Spiral Direction',
              <Select
                value={settings.spiralDirection}
                onValueChange={(value) => handleSettingChange('spiralDirection', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select spiral direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clockwise">Clockwise</SelectItem>
                  <SelectItem value="counterclockwise">Counterclockwise</SelectItem>
                </SelectContent>
              </Select>
            )}
          </>
        )}
      </>
    )}
  </AccordionContent>
</AccordionItem>

  <AccordionItem value="rotation">
    <AccordionTrigger>Rotation Settings</AccordionTrigger>
    <AccordionContent className="space-y-4">
      {renderSettingControl('rotation', 'Rotation',
        <Slider
          value={[settings.rotation]}
          onValueChange={([value]) => handleSettingChange('rotation', value)}
          min={0}
          max={360}
          step={1}
        />
      )}
      {renderSettingControl('offsetIncrementRotation', 'Offset Increment Rotation',
        <Switch
          checked={settings.offsetIncrementRotation}
          onCheckedChange={(checked) => handleSettingChange('offsetIncrementRotation', checked)}
        />
      )}
      {settings.offsetIncrementRotation && (
        <>
          {renderSettingControl('offsetRotationFactor', 'Rotation Factor',
            <Slider
              value={[settings.offsetRotationFactor]}
              onValueChange={([value]) => handleSettingChange('offsetRotationFactor', value)}
              min={0.1}
              max={5}
              step={0.1}
            />
          )}
          {renderSettingControl('offsetRotationBase', 'Rotation Base',
            <Slider
              value={[settings.offsetRotationBase]}
              onValueChange={([value]) => handleSettingChange('offsetRotationBase', value)}
              min={1}
              max={720}
              step={1}
            />
          )}
        </>
      )}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="randomization">
    <AccordionTrigger>Randomization Settings</AccordionTrigger>
    <AccordionContent className="space-y-4">
      {renderSettingControl('randomizePosition', 'Randomize Position',
        <Switch
          checked={settings.randomizePosition}
          onCheckedChange={(checked) => handleSettingChange('randomizePosition', checked)}
        />
      )}
      {renderSettingControl('randomizeColor', 'Randomize Color',
        <Switch
          checked={settings.randomizeColor}
          onCheckedChange={(checked) => handleSettingChange('randomizeColor', checked)}
        />
      )}
      {renderSettingControl('opacityRandomization', 'Opacity Randomization',
        <Slider
          value={[settings.opacityRandomization]}
          onValueChange={([value]) => handleSettingChange('opacityRandomization', value)}
          min={0}
          max={1}
          step={0.01}
        />
      )}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="animation">
    <AccordionTrigger>Animation Settings</AccordionTrigger>
    <AccordionContent className="space-y-4">
      {renderSettingControl('animationEnabled', 'Enable Animation',
        <Switch
          checked={settings.animationEnabled}
          onCheckedChange={(checked) => handleSettingChange('animationEnabled', checked)}
        />
      )}
      {settings.animationEnabled && (
        <>
          {renderSettingControl('animationPattern', 'Animation Pattern',
            <Select
              value={settings['animationPattern']}
              onValueChange={(value) => handleSettingChange('animationPattern', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select animation pattern" />
              </SelectTrigger>
              <SelectContent>
                {['linear', 'circular', 'bounce', 'random'].map((pattern) => (
                  <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {renderSettingControl('animationSpeed', 'Animation Speed',
            <Slider
              value={[settings.animationSpeed]}
              onValueChange={([value]) => handleSettingChange('animationSpeed', value)}
              min={0.0001}
              max={0.01}
              step={0.0001}
            />
          )}
          {renderSettingControl('animationDirection', 'Animation Direction',
            <Slider
              value={[settings.animationDirection]}
              onValueChange={([value]) => handleSettingChange('animationDirection', value)}
              min={0}
              max={360}
              step={1}
            />
          )}
        </>
      )}
    </AccordionContent>
  </AccordionItem>



</Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PatternGenerator;