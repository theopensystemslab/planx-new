-- SQL query to reverse the migration in the analytics_logs and lowcal_sessions tables, which basically reassigns the property type to the old one
-- Keep in mind that this DOWN query would take some general 'commercial' types and incorrectly assign them.
with changes as ( select  allow_list_answers -> 'property.type' ->> 0 as current_pt,
case allow_list_answers -> 'property.type' ->> 0
when 'commercial.industrial.abattoir' then	'commercial.abattoir'
when 'commercial' then	'commercial.ancilliary'
when 'commercial.utility.CCTV' then	'commercial.community.CCTV'
when 'commercial.community.cemetery' then	'commercial.community.cemetary'
when 'commercial.community.cemetery.cemetery' then	'commercial.community.cemetary.cemetary'
when 'commercial.community.cemetery.chapelOfRest' then	'commercial.community.cemetary.chapelOfRest'
when 'commercial.community.cemetery.columbarium' then	'commercial.community.cemetary.columbarium'
when 'commercial.community.cemetery.columbarium' then	'commercial.community.cemetary.columbarium'
when 'commercial.community.cemetery.crematorium' then	'commercial.community.cemetary.crematorium'
when 'commercial.community.cemetery.military' then	'commercial.community.cemetary.military'
when 'commercial.education.school.secondary' then	'commercial.education.secondarySchool'
when 'commercial.education.school.secondary.private' then	'commercial.education.secondarySchool.private'
when 'commercial.education.school.secondary.state' then	'commercial.education.secondarySchool.state'
when 'commercial.industrial.fishProcessing' then	'commercial.fish.processing'
when 'commercial.agriculture.horticulture' then	'commercial.horticulture'
when 'land.smallholding' then	'commercial.horticulture.smallholding'
when 'commercial.agriculture.horticulture.vineyard' then	'commercial.horticulture.vineyard'
when 'commercial.agriculture.horticulture.watercress' then	'commercial.horticulture.watercress'
when 'commercial.storage.distribution' then	'commercial.industrial.distribution'
when 'commercial.storage.distribution.solidFuel' then	'commercial.industrial.distribution.solidFueld'
when 'commercial.storage.distribution.timber' then	'commercial.industrial.distribution.timber'
when 'commercial.storage' then	'commercial.industrial.light.storage'
when 'commercial.storage.crops' then	'commercial.industrial.light.storage.crops'
when 'commercial.storage.solidFuel' then	'commercial.industrial.light.storage.solidFuel'
when 'commercial.storage.timber' then	'commercial.industrial.light.storage.timber'
when 'other.information' then	'commercial.information'
when 'other.information.advertising' then	'commercial.information.advertising'
when 'other.information.touristSign' then	'commercial.information.tourist.sign'
when 'commercial.retail.visitorInformation' then	'commercial.information.tourist.visitor'
when 'other.information.trafficSign' then	'commercial.information.traffic.sign'
when 'commercial.leisure.museum.historicVehicles' then	'commercial.leisure.sport.historicVehicles'
when 'commercial.medical.careHome' then	'commercial.medical.care.home'
when 'commercial.medical.hospital' then	'commercial.medical.care.hospital'
when 'commercial.utility.atm' then	'commercial.retail.atm'
when 'commercial.storage.land' then	'commercial.storageLand'
when 'commercial.industrial.buildersYard' then	'commercial.storageLand.building'
when 'commercial.storage.land.general' then	'commercial.storageLand.general'
when 'commercial.transport.road.bus' then	'commercial.transport.bus'
when 'commercial.transport.water.dock' then	'commercial.transport.dock'
when 'commercial.transport.water.dock.ferry.passengers' then	'commercial.transport.dock.ferry.passengers'
when 'commercial.transport.water.dock.ferry.vehicles' then	'commercial.transport.dock.ferry.vehicles'
when 'commercial.transport.water.dock.generalBerth' then	'commercial.transport.dock.generalBerth'
when 'commercial.transport.water.dock.refuelling' then	'commercial.transport.dock.refuelling'
when 'commercial.transport.water.dock.slipway' then	'commercial.transport.dock.slipway'
when 'commercial.transport.water.dock.passenger' then	'commercial.transport.dock.slipway'
when 'commercial.transport.water.dock.tankerBerth' then	'commercial.transport.dock.tankerBerth'
when 'commercial.transport.water.infrastructure.aqueduct' then	'commercial.transport.infrastructure.aqueduct'
when 'commercial.transport.water.infrastructure.lock' then	'commercial.transport.infrastructure.lock'
when 'commercial.transport.road.infrastructure.weighing' then	'commercial.transport.infrastructure.weighing'
when 'commercial.transport.water.infrastructure.weir' then	'commercial.transport.infrastructure.weir'
when 'commercial.transport.water.marina' then	'commercial.transport.marina'
when 'commercial.transport.water.mooring' then	'commercial.transport.mooring'
when 'commercial.transport.road.overnightLorryPark' then	'commercial.transport.overnightLorryPark'
when 'commercial.transport.road.parking' then	'commercial.transport.parking'
when 'commercial.transport.road.parking.car' then	'commercial.transport.parking.car'
when 'commercial.transport.road.parking.coach' then	'commercial.transport.parking.coach'
when 'commercial.transport.road.parking.commercialVehicle' then	'commercial.transport.parking.commercialVehicle'
when 'commercial.transport.road.parking.parkAndRide' then	'commercial.transport.parking.parkAndRide'
when 'commercial.transport.rail.railAsset' then	'commercial.transport.railAsset'
when 'commercial.storage.transport' then	'commercial.transport.storage'
when 'commercial.storage.transport.boat' then	'commercial.transport.storage.boat'
when 'commercial.storage.transport.bus' then	'commercial.transport.storage.bus'
when 'commercial.transport.road.terminal.bus' then	'commercial.transport.terminal.bus'
when 'commercial.transport.rail.terminal' then	'commercial.transport.terminal.train'
when 'commercial.transport.rail.terminal' then	'commercial.transport.terminal.vehicularRail'
when 'commercial.transport.rail.track' then	'commercial.transport.track'
when 'commercial.transport.rail.track' then	'commercial.transport.track.cliff'
when 'commercial.transport.rail.monorail' then	'commercial.transport.track.monorail'
when 'commercial.agriculture.land' then	'land.agriculture'
when 'commercial.agriculture.land.crops' then	'land.agriculture.crops'
when 'commercial.agriculture.land.grazing' then	'land.agriculture.grazing'
when 'commercial.agriculture.land.orchard' then	'land.agriculture.orchard'
when 'other.ancillary' then	'land.building'
when 'other.ancillary.aviary' then	'land.building.aviary'
when 'other.ancillary.bandstand' then	'land.building.bandstand'
when 'other.ancillary.pavilion' then	'land.building.pavilion'
when 'other.ancillary.sportsViewing' then	'land.building.sportsViewing'
when 'residential' then	'residential.dwelling'
when 'residential.boat' then	'residential.dwelling.boat'
when 'residential.caravan' then	'residential.dwelling.caravan'
when 'residential.flat' then	'residential.dwelling.flat'
when 'residential.multiple' then	'residential.dwelling.flat.multiple'
when 'residential.holiday' then	'residential.dwelling.holiday'
when 'residential.house' then	'residential.dwelling.house'
when 'residential.house.detached' then	'residential.dwelling.house.detached'
when 'residential.multiple' then	'residential.dwelling.house.multiple'
when 'residential.house.semiDetached' then	'residential.dwelling.house.semiDetached'
when 'residential.house.terrace' then	'residential.dwelling.house.terrace'
when 'residential.house.terrace.end' then	'residential.dwelling.house.terrace.end'
when 'residential.house.terrace.mid' then	'residential.dwelling.house.terrace.mid'
when 'residential.liveWork' then	'residential.dwelling.liveWork'
when 'residential.shelteredAccommodation' then	'residential.dwelling.shelteredAccommodation'
when 'residential.student' then	'residential.HMO.student'
end as new_type, allow_list_answers, id
from analytics_logs
where allow_list_answers is not null and
allow_list_answers -> 'property.type' ->> 0 in
('commercial.industrial.abattoir','commercial','commercial.utility.CCTV','commercial.community.cemetery',
'commercial.community.cemetery.cemetery','commercial.community.cemetery.chapelOfRest','commercial.community.cemetery.columbarium',
'commercial.community.cemetery.columbarium','commercial.community.cemetery.crematorium','commercial.community.cemetery.military',
'commercial.education.school.secondary','commercial.education.school.secondary.private',
'commercial.education.school.secondary.state','commercial.industrial.fishProcessing','commercial.agriculture.horticulture',
'land.smallholding','commercial.agriculture.horticulture.vineyard','commercial.agriculture.horticulture.watercress',
'commercial.storage.distribution','commercial.storage.distribution.solidFuel','commercial.storage.distribution.timber',
'commercial.storage','commercial.storage.crops','commercial.storage.solidFuel','commercial.storage.timber','other.information',
'other.information.advertising','other.information.touristSign','commercial.retail.visitorInformation','other.information.trafficSign',
'commercial.leisure.museum.historicVehicles','commercial.medical.careHome','commercial.medical.hospital','commercial.utility.atm',
'commercial.storage.land','commercial.industrial.buildersYard','commercial.storage.land.general','commercial.transport.road.bus',
'commercial.transport.water.dock','commercial.transport.water.dock.ferry.passengers','commercial.transport.water.dock.ferry.vehicles',
'commercial.transport.water.dock.generalBerth','commercial.transport.water.dock.refuelling','commercial.transport.water.dock.slipway',
'commercial.transport.water.dock.passenger','commercial.transport.water.dock.tankerBerth','commercial.transport.water.infrastructure.aqueduct',
'commercial.transport.water.infrastructure.lock','commercial.transport.road.infrastructure.weighing',
'commercial.transport.water.infrastructure.weir','commercial.transport.water.marina','commercial.transport.water.mooring',
'commercial.transport.road.overnightLorryPark','commercial.transport.road.parking','commercial.transport.road.parking.car',
'commercial.transport.road.parking.coach','commercial.transport.road.parking.commercialVehicle',
'commercial.transport.road.parking.parkAndRide','commercial.transport.rail.railAsset','commercial.storage.transport',
'commercial.storage.transport.boat','commercial.storage.transport.bus','commercial.transport.road.terminal.bus',
'commercial.transport.rail.terminal','commercial.transport.rail.terminal','commercial.transport.rail.track',
'commercial.transport.rail.track','commercial.transport.rail.monorail','commercial.agriculture.land',
'commercial.agriculture.land.crops','commercial.agriculture.land.grazing','commercial.agriculture.land.orchard','other.ancillary',
'other.ancillary.aviary','other.ancillary.bandstand','other.ancillary.pavilion','other.ancillary.sportsViewing',
'residential','residential.boat','residential.caravan','residential.flat','residential.multiple','residential.holiday',
'residential.house','residential.house.detached','residential.multiple','residential.house.semiDetached','residential.house.terrace',
'residential.house.terrace.end','residential.house.terrace.mid','residential.liveWork','residential.shelteredAccommodation',
'residential.student')
)
UPDATE analytics_logs SET allow_list_answers = JSONB_SET(c.allow_list_answers, '{property.type,0}', to_jsonb(c.new_type))
  FROM changes AS c
  WHERE analytics_logs.id = c.id;



with changes as ( select  allow_list_answers -> 'property.type' ->> 0 as current_pt,
case allow_list_answers -> 'property.type' ->> 0
when 'commercial.industrial.abattoir' then	'commercial.abattoir'
when 'commercial' then	'commercial.ancilliary'
when 'commercial.utility.CCTV' then	'commercial.community.CCTV'
when 'commercial.community.cemetery' then	'commercial.community.cemetary'
when 'commercial.community.cemetery.cemetery' then	'commercial.community.cemetary.cemetary'
when 'commercial.community.cemetery.chapelOfRest' then	'commercial.community.cemetary.chapelOfRest'
when 'commercial.community.cemetery.columbarium' then	'commercial.community.cemetary.columbarium'
when 'commercial.community.cemetery.columbarium' then	'commercial.community.cemetary.columbarium'
when 'commercial.community.cemetery.crematorium' then	'commercial.community.cemetary.crematorium'
when 'commercial.community.cemetery.military' then	'commercial.community.cemetary.military'
when 'commercial.education.school.secondary' then	'commercial.education.secondarySchool'
when 'commercial.education.school.secondary.private' then	'commercial.education.secondarySchool.private'
when 'commercial.education.school.secondary.state' then	'commercial.education.secondarySchool.state'
when 'commercial.industrial.fishProcessing' then	'commercial.fish.processing'
when 'commercial.agriculture.horticulture' then	'commercial.horticulture'
when 'land.smallholding' then	'commercial.horticulture.smallholding'
when 'commercial.agriculture.horticulture.vineyard' then	'commercial.horticulture.vineyard'
when 'commercial.agriculture.horticulture.watercress' then	'commercial.horticulture.watercress'
when 'commercial.storage.distribution' then	'commercial.industrial.distribution'
when 'commercial.storage.distribution.solidFuel' then	'commercial.industrial.distribution.solidFueld'
when 'commercial.storage.distribution.timber' then	'commercial.industrial.distribution.timber'
when 'commercial.storage' then	'commercial.industrial.light.storage'
when 'commercial.storage.crops' then	'commercial.industrial.light.storage.crops'
when 'commercial.storage.solidFuel' then	'commercial.industrial.light.storage.solidFuel'
when 'commercial.storage.timber' then	'commercial.industrial.light.storage.timber'
when 'other.information' then	'commercial.information'
when 'other.information.advertising' then	'commercial.information.advertising'
when 'other.information.touristSign' then	'commercial.information.tourist.sign'
when 'commercial.retail.visitorInformation' then	'commercial.information.tourist.visitor'
when 'other.information.trafficSign' then	'commercial.information.traffic.sign'
when 'commercial.leisure.museum.historicVehicles' then	'commercial.leisure.sport.historicVehicles'
when 'commercial.medical.careHome' then	'commercial.medical.care.home'
when 'commercial.medical.hospital' then	'commercial.medical.care.hospital'
when 'commercial.utility.atm' then	'commercial.retail.atm'
when 'commercial.storage.land' then	'commercial.storageLand'
when 'commercial.industrial.buildersYard' then	'commercial.storageLand.building'
when 'commercial.storage.land.general' then	'commercial.storageLand.general'
when 'commercial.transport.road.bus' then	'commercial.transport.bus'
when 'commercial.transport.water.dock' then	'commercial.transport.dock'
when 'commercial.transport.water.dock.ferry.passengers' then	'commercial.transport.dock.ferry.passengers'
when 'commercial.transport.water.dock.ferry.vehicles' then	'commercial.transport.dock.ferry.vehicles'
when 'commercial.transport.water.dock.generalBerth' then	'commercial.transport.dock.generalBerth'
when 'commercial.transport.water.dock.refuelling' then	'commercial.transport.dock.refuelling'
when 'commercial.transport.water.dock.slipway' then	'commercial.transport.dock.slipway'
when 'commercial.transport.water.dock.passenger' then	'commercial.transport.dock.slipway'
when 'commercial.transport.water.dock.tankerBerth' then	'commercial.transport.dock.tankerBerth'
when 'commercial.transport.water.infrastructure.aqueduct' then	'commercial.transport.infrastructure.aqueduct'
when 'commercial.transport.water.infrastructure.lock' then	'commercial.transport.infrastructure.lock'
when 'commercial.transport.road.infrastructure.weighing' then	'commercial.transport.infrastructure.weighing'
when 'commercial.transport.water.infrastructure.weir' then	'commercial.transport.infrastructure.weir'
when 'commercial.transport.water.marina' then	'commercial.transport.marina'
when 'commercial.transport.water.mooring' then	'commercial.transport.mooring'
when 'commercial.transport.road.overnightLorryPark' then	'commercial.transport.overnightLorryPark'
when 'commercial.transport.road.parking' then	'commercial.transport.parking'
when 'commercial.transport.road.parking.car' then	'commercial.transport.parking.car'
when 'commercial.transport.road.parking.coach' then	'commercial.transport.parking.coach'
when 'commercial.transport.road.parking.commercialVehicle' then	'commercial.transport.parking.commercialVehicle'
when 'commercial.transport.road.parking.parkAndRide' then	'commercial.transport.parking.parkAndRide'
when 'commercial.transport.rail.railAsset' then	'commercial.transport.railAsset'
when 'commercial.storage.transport' then	'commercial.transport.storage'
when 'commercial.storage.transport.boat' then	'commercial.transport.storage.boat'
when 'commercial.storage.transport.bus' then	'commercial.transport.storage.bus'
when 'commercial.transport.road.terminal.bus' then	'commercial.transport.terminal.bus'
when 'commercial.transport.rail.terminal' then	'commercial.transport.terminal.train'
when 'commercial.transport.rail.terminal' then	'commercial.transport.terminal.vehicularRail'
when 'commercial.transport.rail.track' then	'commercial.transport.track'
when 'commercial.transport.rail.track' then	'commercial.transport.track.cliff'
when 'commercial.transport.rail.monorail' then	'commercial.transport.track.monorail'
when 'commercial.agriculture.land' then	'land.agriculture'
when 'commercial.agriculture.land.crops' then	'land.agriculture.crops'
when 'commercial.agriculture.land.grazing' then	'land.agriculture.grazing'
when 'commercial.agriculture.land.orchard' then	'land.agriculture.orchard'
when 'other.ancillary' then	'land.building'
when 'other.ancillary.aviary' then	'land.building.aviary'
when 'other.ancillary.bandstand' then	'land.building.bandstand'
when 'other.ancillary.pavilion' then	'land.building.pavilion'
when 'other.ancillary.sportsViewing' then	'land.building.sportsViewing'
when 'residential' then	'residential.dwelling'
when 'residential.boat' then	'residential.dwelling.boat'
when 'residential.caravan' then	'residential.dwelling.caravan'
when 'residential.flat' then	'residential.dwelling.flat'
when 'residential.multiple' then	'residential.dwelling.flat.multiple'
when 'residential.holiday' then	'residential.dwelling.holiday'
when 'residential.house' then	'residential.dwelling.house'
when 'residential.house.detached' then	'residential.dwelling.house.detached'
when 'residential.multiple' then	'residential.dwelling.house.multiple'
when 'residential.house.semiDetached' then	'residential.dwelling.house.semiDetached'
when 'residential.house.terrace' then	'residential.dwelling.house.terrace'
when 'residential.house.terrace.end' then	'residential.dwelling.house.terrace.end'
when 'residential.house.terrace.mid' then	'residential.dwelling.house.terrace.mid'
when 'residential.liveWork' then	'residential.dwelling.liveWork'
when 'residential.shelteredAccommodation' then	'residential.dwelling.shelteredAccommodation'
when 'residential.student' then	'residential.HMO.student'
end as new_type, allow_list_answers, id
from lowcal_sessions
where allow_list_answers is not null and
allow_list_answers -> 'property.type' ->> 0 in
('commercial.industrial.abattoir','commercial','commercial.utility.CCTV','commercial.community.cemetery',
'commercial.community.cemetery.cemetery','commercial.community.cemetery.chapelOfRest','commercial.community.cemetery.columbarium',
'commercial.community.cemetery.columbarium','commercial.community.cemetery.crematorium','commercial.community.cemetery.military',
'commercial.education.school.secondary','commercial.education.school.secondary.private',
'commercial.education.school.secondary.state','commercial.industrial.fishProcessing','commercial.agriculture.horticulture',
'land.smallholding','commercial.agriculture.horticulture.vineyard','commercial.agriculture.horticulture.watercress',
'commercial.storage.distribution','commercial.storage.distribution.solidFuel','commercial.storage.distribution.timber',
'commercial.storage','commercial.storage.crops','commercial.storage.solidFuel','commercial.storage.timber','other.information',
'other.information.advertising','other.information.touristSign','commercial.retail.visitorInformation','other.information.trafficSign',
'commercial.leisure.museum.historicVehicles','commercial.medical.careHome','commercial.medical.hospital','commercial.utility.atm',
'commercial.storage.land','commercial.industrial.buildersYard','commercial.storage.land.general','commercial.transport.road.bus',
'commercial.transport.water.dock','commercial.transport.water.dock.ferry.passengers','commercial.transport.water.dock.ferry.vehicles',
'commercial.transport.water.dock.generalBerth','commercial.transport.water.dock.refuelling','commercial.transport.water.dock.slipway',
'commercial.transport.water.dock.passenger','commercial.transport.water.dock.tankerBerth','commercial.transport.water.infrastructure.aqueduct',
'commercial.transport.water.infrastructure.lock','commercial.transport.road.infrastructure.weighing',
'commercial.transport.water.infrastructure.weir','commercial.transport.water.marina','commercial.transport.water.mooring',
'commercial.transport.road.overnightLorryPark','commercial.transport.road.parking','commercial.transport.road.parking.car',
'commercial.transport.road.parking.coach','commercial.transport.road.parking.commercialVehicle',
'commercial.transport.road.parking.parkAndRide','commercial.transport.rail.railAsset','commercial.storage.transport',
'commercial.storage.transport.boat','commercial.storage.transport.bus','commercial.transport.road.terminal.bus',
'commercial.transport.rail.terminal','commercial.transport.rail.terminal','commercial.transport.rail.track',
'commercial.transport.rail.track','commercial.transport.rail.monorail','commercial.agriculture.land',
'commercial.agriculture.land.crops','commercial.agriculture.land.grazing','commercial.agriculture.land.orchard','other.ancillary',
'other.ancillary.aviary','other.ancillary.bandstand','other.ancillary.pavilion','other.ancillary.sportsViewing',
'residential','residential.boat','residential.caravan','residential.flat','residential.multiple','residential.holiday',
'residential.house','residential.house.detached','residential.multiple','residential.house.semiDetached','residential.house.terrace',
'residential.house.terrace.end','residential.house.terrace.mid','residential.liveWork','residential.shelteredAccommodation',
'residential.student')
)
UPDATE lowcal_sessions SET allow_list_answers = JSONB_SET(c.allow_list_answers, '{property.type,0}', to_jsonb(c.new_type))
  FROM changes AS c
  WHERE lowcal_sessions.id = c.id;