"use client"
import * as React from "react"
import lottie, { AnimationItem } from "lottie-web"

type Variant = "animated" | "static"

interface AnimatedTrashIconProps {
  size?: number
  color?: string
  variant?: Variant
  className?: string
}

const animationData = {"v":"5.6.5","fr":30,"ip":0,"op":5,"w":32,"h":32,"nm":"trash","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"trash","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[16,18.5,0],"ix":2},"a":{"a":0,"k":[16,16,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[-1.104,0],[0,0],[0,-1.104],[0,0]],"o":[[0,0],[0,-1.104],[0,0],[1.104,0],[0,0],[0,0]],"v":[[-4,2],[-4,0],[-2,-2],[2,-2],[4,0],[4,2]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0,0,0,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":2,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[16,8],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"handle","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[7,10],[9,10],[25,10]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0,0,0,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":2,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"cover","np":2,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":1,"k":[{"i":{"x":0.794,"y":1},"o":{"x":0.157,"y":0},"t":0,"s":[23.003,9],"to":[0,-0.133],"ti":[0,0.034]},{"t":5,"s":[23.003,6]}],"ix":2},"a":{"a":0,"k":[23.003,10],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":0,"s":[0]},{"t":5,"s":[20]}],"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"cover","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[1.104,0],[0,0],[0,1.104],[0,0]],"o":[[0,0],[0,1.104],[0,0],[-1.104,0],[0,0],[0,0]],"v":[[7,-8],[7,6],[5,8],[-5,8],[-7,6],[-7,-8]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0,0,0,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":2,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":1,"k":[{"i":{"x":0.833,"y":1},"o":{"x":0.167,"y":0},"t":0,"s":[16,18],"to":[0,0.167],"ti":[0,-0.167]},{"t":5,"s":[16,19]}],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"bin","np":2,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":5,"st":0,"bm":0}],"markers":[]}

export const AnimatedTrashIcon: React.FC<AnimatedTrashIconProps> = ({
  size = 24,
  color = "hsl(var(--icon-color))",
  variant = "animated",
  className = "",
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const animRef = React.useRef<AnimationItem | null>(null)

  React.useEffect(() => {
    if (variant !== "animated" || !containerRef.current) return

    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData,
    })

    return () => {
      animRef.current?.destroy()
    }
  }, [variant])

  const handleMouseEnter = () => {
    animRef.current?.setDirection(1)
    animRef.current?.play()
  }

  const handleMouseLeave = () => {
    animRef.current?.setDirection(-1)
    animRef.current?.play()
  }

    const handleClick = () => {
    animRef.current?.setDirection(-1)
    animRef.current?.play()
  }

  const styles = {
    width: size,
    height: size,
    color,
  }

  if (variant === "animated") {
    return (
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={styles}
        className={`icon-wrapper ${className}`.trim()}
      />
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`feather feather-trash ${className}`.trim()}
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  )
}